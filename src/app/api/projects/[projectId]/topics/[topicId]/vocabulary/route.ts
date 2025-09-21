import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(_req: Request, { params }: { params: { topicId: string } }) {
  const { topicId } = params;
  const list = await prisma.vocabulary.findMany({ where: { topicId } });
  return NextResponse.json(list);
}

export async function POST(req: Request, { params }: { params: { topicId: string } }) {
  const { topicId } = params;
  const body = await req.json();
  const item = await prisma.vocabulary.create({ data: {
    kanji: body.kanji || null,
    kana: body.kana || null,
    meaning: body.meaning || '',
    image: body.image || null,
    type: body.type || 1,
    topicId,
  } });
  return NextResponse.json(item, { status: 201 });
}
