import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Redis } from "@upstash/redis";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";

const redis = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
  : null;

export async function GET(
  req: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { projectId } = await params;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check project ownership
    const project = await prisma.project.findUnique({
      where: { id: projectId }
    });

    if (!project || project.ownerId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const cacheKey = `topics:${projectId}`;

    // Check cache first (if Redis is available)
    if (redis) {
      try {
        const cached = await redis.get(cacheKey);
        if (cached && typeof cached === 'string') {
          return NextResponse.json(JSON.parse(cached));
        }
      } catch (cacheError) {
        console.warn('Cache read error:', cacheError);
        // Continue to database query
      }
    }

    // Return lightweight topics for a project with per-topic vocabulary counts
    const topics = await prisma.topic.findMany({
      where: { projectId },
      select: {
        id: true,
        title: true,
        createdAt: true,
        _count: { select: { vocabulary: true } }
      }
    });

    const results = topics.map((t) => ({
      id: t.id,
      title: t.title,
      wordsCount: (t as any)._count?.vocabulary ?? 0
    }));

    // Cache the result (if Redis is available)
    if (redis) {
      await redis.setex(cacheKey, 600, JSON.stringify(results)); // 10 minutes TTL
    }

    return NextResponse.json(results);
  } catch (error) {
    console.error('Error in GET /api/projects/[projectId]/topics:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { projectId } = await params;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check project ownership
    const project = await prisma.project.findUnique({
      where: { id: projectId }
    });

    if (!project || project.ownerId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const topic = await prisma.topic.create({
      data: { title: body.title, projectId }
    });

    // Invalidate caches (if Redis is available)
    if (redis) {
      await redis.del(`topics:${projectId}`);
      await redis.del(`projects:list:${user.id}`);
      await redis.del(`project:${projectId}`);
    }

    return NextResponse.json(topic, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/projects/[projectId]/topics:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
