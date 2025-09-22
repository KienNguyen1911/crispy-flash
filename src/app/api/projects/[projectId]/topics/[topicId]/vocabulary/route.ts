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

export async function PATCH(req: Request, { params }: { params: { topicId: string, projectId: string } }) {
  const { topicId } = params;
  const body = await req.json();
  const updates: Array<{ id: string; status: string }> = body.updates || [];

  if (!Array.isArray(updates) || updates.length === 0) {
    return NextResponse.json({ error: 'No updates provided' }, { status: 400 });
  }

  // Apply updates in a transaction
  const ops = updates.map(u => prisma.vocabulary.update({ where: { id: u.id }, data: { status: u.status } }));
  try {
    const results = await prisma.$transaction(ops);
    return NextResponse.json({ updated: results.length });
  } catch (err: any) {
    console.error('Batch update error', err);
    return NextResponse.json({ error: 'Failed to update vocabulary statuses' }, { status: 500 });
  }
}
