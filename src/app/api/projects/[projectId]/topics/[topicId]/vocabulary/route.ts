import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';

export async function GET(_req: Request, { params }: { params: Promise<{ projectId: string; topicId: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { projectId, topicId } = await params;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check project ownership
    const project = await prisma.project.findUnique({
      where: { id: projectId }
    });

    if (!project || project.ownerId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const list = await prisma.vocabulary.findMany({ where: { topicId } });
    return NextResponse.json(list);
  } catch (error) {
    console.error('Error in GET /api/projects/[projectId]/topics/[topicId]/vocabulary:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ projectId: string; topicId: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { projectId, topicId } = await params;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check project ownership
    const project = await prisma.project.findUnique({
      where: { id: projectId }
    });

    if (!project || project.ownerId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

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
  } catch (error) {
    console.error('Error in POST /api/projects/[projectId]/topics/[topicId]/vocabulary:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ projectId: string; topicId: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { projectId, topicId } = await params;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check project ownership
    const project = await prisma.project.findUnique({
      where: { id: projectId }
    });

    if (!project || project.ownerId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

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
  } catch (error) {
    console.error('Error in PATCH /api/projects/[projectId]/topics/[topicId]/vocabulary:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
