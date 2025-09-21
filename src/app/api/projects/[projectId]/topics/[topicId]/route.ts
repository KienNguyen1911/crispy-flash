import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(_req: Request, { params }: { params: { topicId: string } }) {
  const { topicId } = params;
  const topic = await prisma.topic.findUnique({ where: { id: topicId }, include: { vocabulary: true } });
  if (!topic) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(topic);
}

export async function PATCH(req: Request, { params }: { params: { topicId: string } }) {
  const { topicId } = params;
  const body = await req.json();
  const topic = await prisma.topic.update({ where: { id: topicId }, data: { title: body.title } });
  return NextResponse.json(topic);
}

export async function DELETE(_req: Request, { params }: { params: { topicId: string } }) {
  const { topicId } = params;
  await prisma.vocabulary.deleteMany({ where: { topicId } });
  await prisma.topic.delete({ where: { id: topicId } });
  return NextResponse.json({ ok: true });
}
