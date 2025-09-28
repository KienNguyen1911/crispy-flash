import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(_req: Request, { params }: { params: Promise<{ projectId: string; topicId: string }> }) {
  const { topicId } = await params;
  const list = await prisma.vocabulary.findMany({ where: { topicId } });
  return NextResponse.json(list);
}

export async function POST(req: Request, { params }: { params: Promise<{ projectId: string; topicId: string }> }) {
  const { topicId } = await params;
  const body = await req.json();
  console.log('Received body:', typeof body, Array.isArray(body), body.length || 'N/A');

  // Check if body is an array for bulk insert
  if (Array.isArray(body)) {
    console.log(`Bulk inserting ${body.length} vocabulary items for topic ${topicId}`);
    try {
      const items = await prisma.vocabulary.createMany({
        data: body.map(item => ({
          kanji: item.kanji || null,
          kana: item.kana || null,
          meaning: item.meaning || '',
          image: item.image || null,
          type: item.type || 1,
          topicId,
        }))
      });
      console.log(`Successfully created ${items.count} vocabulary items`);
      return NextResponse.json({ created: items.count }, { status: 201 });
    } catch (error) {
      console.error('Bulk insert error:', error);
      return NextResponse.json({ error: 'Failed to create vocabulary items' }, { status: 500 });
    }
  } else {
    // Single item
    try {
      const item = await prisma.vocabulary.create({ data: {
        kanji: body.kanji || null,
        kana: body.kana || null,
        meaning: body.meaning || '',
        image: body.image || null,
        type: body.type || 1,
        topicId,
      } });
      return NextResponse.json(item, { status: 201 });
    } catch (error) {
      console.error('Single insert error:', error);
      return NextResponse.json({ error: 'Failed to create vocabulary item' }, { status: 500 });
    }
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ projectId: string; topicId: string }> }) {
  const { topicId } = await params;
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
