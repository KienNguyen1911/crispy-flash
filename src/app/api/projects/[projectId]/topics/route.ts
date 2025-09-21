import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(_req: Request, { params }: { params: { projectId: string } }) {
  const { projectId } = params;
  const topics = await prisma.topic.findMany({ where: { projectId }, include: { vocabulary: true } });
  return NextResponse.json(topics);
}

export async function POST(req: Request, { params }: { params: { projectId: string } }) {
  const { projectId } = params;
  const body = await req.json();
  const topic = await prisma.topic.create({ data: { title: body.title, projectId } });
  return NextResponse.json(topic, { status: 201 });
}
