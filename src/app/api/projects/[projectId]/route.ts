import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: Request,
  { params }: { params: { projectId: string } }
) {
  const { projectId } = params;
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: { topics: { include: { vocabulary: true } } }
  });

  if (!project)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json(project);
}

export async function PATCH(
  req: Request,
  { params }: { params: { projectId: string } }
) {
  const { projectId } = params;
  const body = await req.json();
  const project = await prisma.project.update({
    where: { id: projectId },
    data: { title: body.title, description: body.description }
  });

  return NextResponse.json(project);
}

export async function DELETE(
  _req: Request,
  { params }: { params: { projectId: string } }
) {
  const { projectId } = params;
  // delete topics and vocabulary first to avoid FK constraint
  await prisma.vocabulary.deleteMany({
    where: { topic: { projectId } } as any
  });
  await prisma.topic.deleteMany({ where: { projectId } });
  await prisma.project.delete({ where: { id: projectId } });

  return NextResponse.json({ ok: true });
}
