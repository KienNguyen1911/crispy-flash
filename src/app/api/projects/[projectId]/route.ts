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
  _req: Request,
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

    const cacheKey = `project:${projectId}`;

    // Check cache first (if Redis is available)
    if (redis) {
      try {
        const cached = await redis.get(cacheKey);
        if (cached && typeof cached === 'string') {
          const cachedProject = JSON.parse(cached);
          // Check if cached project belongs to user
          if (cachedProject.ownerId === user.id) {
            return NextResponse.json(cachedProject);
          }
        }
      } catch (cacheError) {
        console.warn('Cache read error:', cacheError);
        // Continue to database query
      }
    }

    const project = await prisma.project.findUnique({
      where: { id: projectId }
    });

    if (!project) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Check ownership
    if (project.ownerId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Cache the result (if Redis is available)
    if (redis) {
      await redis.setex(cacheKey, 600, JSON.stringify(project)); // 10 minutes TTL
    }

    return NextResponse.json(project);
  } catch (error) {
    console.error('Error in GET /api/projects/[projectId]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(
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

    // Check ownership
    const project = await prisma.project.findUnique({
      where: { id: projectId }
    });

    if (!project) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (project.ownerId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const updatedProject = await prisma.project.update({
      where: { id: projectId },
      data: { title: body.title, description: body.description }
    });

    // Invalidate cache (if Redis is available)
    if (redis) {
      await redis.del(`project:${projectId}`);
      await redis.del(`projects:list:${user.id}`);
    }

    return NextResponse.json(updatedProject);
  } catch (error) {
    console.error('Error in PATCH /api/projects/[projectId]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
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

    // Check ownership
    const project = await prisma.project.findUnique({
      where: { id: projectId }
    });

    if (!project) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (project.ownerId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // delete topics and vocabulary first to avoid FK constraint
    await prisma.vocabulary.deleteMany({
      where: { topic: { projectId } } as any
    });
    await prisma.topic.deleteMany({ where: { projectId } });
    await prisma.project.delete({ where: { id: projectId } });

    // Invalidate cache (if Redis is available)
    if (redis) {
      await redis.del(`project:${projectId}`);
      await redis.del(`projects:list:${user.id}`);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Error in DELETE /api/projects/[projectId]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
