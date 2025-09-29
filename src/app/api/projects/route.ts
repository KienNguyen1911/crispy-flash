import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { Redis } from '@upstash/redis';

const redis = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
  : null;

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Find the user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const cacheKey = `projects:list:${user.id}`;

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

    // Return lightweight project list: id/title/description with counts only, filtered by owner
    const projects = await prisma.project.findMany({
      where: { ownerId: user.id },
      select: {
        id: true,
        title: true,
        description: true,
        _count: { select: { topics: true } },
        topics: { select: { _count: { select: { vocabulary: true } } } }
      }
    });

    // compute wordsCount per project by summing vocabulary counts from topics
    const results = projects.map((p) => {
      const wordsCount = p.topics.reduce((sum, t) => sum + (t._count?.vocabulary ?? 0), 0);
      return {
        id: p.id,
        title: p.title,
        description: p.description,
        topicsCount: p._count?.topics ?? 0,
        wordsCount,
      };
    });

    // Cache the result (if Redis is available)
    if (redis) {
      await redis.setex(cacheKey, 600, JSON.stringify(results)); // 10 minutes TTL
    }

    return NextResponse.json(results);
  } catch (error) {
    console.error('Error in GET /api/projects:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Find or create user by email
    const user = await prisma.user.upsert({
      where: { email: session.user.email },
      update: {},
      create: { email: session.user.email, name: session.user.name || undefined }
    });

    const body = await req.json();
    const data = {
      title: body.title,
      description: body.description || '',
      ownerId: user.id
    };

    const project = await prisma.project.create({ data });

    // Invalidate projects list cache (if Redis is available)
    if (redis) {
      await redis.del(`projects:list:${user.id}`);
    }

    return NextResponse.json(project, { status: 201 });
  } catch (err: any) {
    console.error('Create project error', err);
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 });
  }
}
