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
  const cacheKey = 'projects:list';

  // Check cache first (if Redis is available)
  if (redis) {
    const cached = await redis.get(cacheKey);
    if (cached) {
      return NextResponse.json(JSON.parse(cached as string));
    }
  }

  // Return lightweight project list: id/title/description with counts only
  const projects = await prisma.project.findMany({
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
    await redis.setex(cacheKey, 300, JSON.stringify(results)); // 5 minutes TTL
  }

  return NextResponse.json(results);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data: any = { title: body.title, description: body.description || '' };
    // try to attach owner from session if available
    try {
      const session = await getServerSession(authOptions as any) as any;
      if (session?.user?.email) {
        // find or create user by email
        const user = await prisma.user.upsert({ where: { email: session.user.email }, update: {}, create: { email: session.user.email, name: session.user.name || undefined } });
        data.ownerId = user.id;
      } else if (body.ownerId) {
        data.ownerId = body.ownerId;
      }
    } catch (e) {
      // ignore session errors and fallback to body.ownerId if provided
      if (body.ownerId) data.ownerId = body.ownerId;
    }
    const project = await prisma.project.create({ data });

    // Invalidate projects list cache (if Redis is available)
    if (redis) {
      await redis.del('projects:list');
    }

    return NextResponse.json(project, { status: 201 });
  } catch (err: any) {
    console.error('Create project error', err);
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 });
  }
}
