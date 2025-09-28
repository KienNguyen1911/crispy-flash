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
  _req: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;
  const cacheKey = `project:${projectId}`;

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

  const project = await prisma.project.findUnique({
    where: { id: projectId }
  });

  if (!project)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Cache the result (if Redis is available)
  if (redis) {
    await redis.setex(cacheKey, 600, JSON.stringify(project)); // 10 minutes TTL
  }

  return NextResponse.json(project);
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;
  const body = await req.json();
  const project = await prisma.project.update({
    where: { id: projectId },
    data: { title: body.title, description: body.description }
  });

  // Invalidate cache (if Redis is available)
  if (redis) {
    await redis.del(`project:${projectId}`);
  }

  return NextResponse.json(project);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;
  // delete topics and vocabulary first to avoid FK constraint
  await prisma.vocabulary.deleteMany({
    where: { topic: { projectId } } as any
  });
  await prisma.topic.deleteMany({ where: { projectId } });
  await prisma.project.delete({ where: { id: projectId } });

  // Invalidate cache (if Redis is available)
  if (redis) {
    await redis.del(`project:${projectId}`);
  }

  return NextResponse.json({ ok: true });
}
