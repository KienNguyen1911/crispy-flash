import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { invalidateCache } from '@/lib/cache';

export async function PATCH(req: Request, { params }: { params: Promise<{ projectId: string; topicId: string; vocabId: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { projectId, vocabId } = await params;

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
    const item = await prisma.vocabulary.update({ where: { id: vocabId }, data: body });
    return NextResponse.json(item);
  } catch (error) {
    console.error('Error in PATCH /api/projects/[projectId]/topics/[topicId]/vocabulary/[vocabId]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ projectId: string; topicId: string; vocabId: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { projectId, topicId, vocabId } = await params;

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

    await prisma.vocabulary.delete({ where: { id: vocabId } });
    await invalidateCache(
      `vocabulary:list:${topicId}`,
      `topics:${projectId}`,
      `projects:list:${user.id}`,
      `project:${projectId}`
    );
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Error in DELETE /api/projects/[projectId]/topics/[topicId]/vocabulary/[vocabId]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
