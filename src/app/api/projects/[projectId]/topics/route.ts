import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Redis } from "@upstash/redis";

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
  const { projectId } = await params;
  const cacheKey = `topics:${projectId}`;

  // Check cache first (if Redis is available)
  if (redis) {
    const cached = await redis.get(cacheKey);
    if (cached) {
      return NextResponse.json(JSON.parse(cached as string));
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
    await redis.setex(cacheKey, 300, JSON.stringify(results)); // 5 minutes TTL
  }

  return NextResponse.json(results);
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;
  const body = await req.json();
  const topic = await prisma.topic.create({
    data: { title: body.title, projectId }
  });

  // Invalidate caches (if Redis is available)
  if (redis) {
    await redis.del(`topics:${projectId}`);
    await redis.del('projects:list');
    await redis.del(`project:${projectId}`);
  }

  return NextResponse.json(topic, { status: 201 });
}
