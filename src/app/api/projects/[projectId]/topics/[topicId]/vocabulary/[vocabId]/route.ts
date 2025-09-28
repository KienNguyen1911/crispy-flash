import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(req: Request, { params }: { params: Promise<{ projectId: string; topicId: string; vocabId: string }> }) {
  const { vocabId } = await params;
  const body = await req.json();
  const item = await prisma.vocabulary.update({ where: { id: vocabId }, data: body });
  return NextResponse.json(item);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ projectId: string; topicId: string; vocabId: string }> }) {
  const { vocabId } = await params;
  await prisma.vocabulary.delete({ where: { id: vocabId } });
  return NextResponse.json({ ok: true });
}
