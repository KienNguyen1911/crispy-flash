import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;
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
  return NextResponse.json(topic, { status: 201 });
}
