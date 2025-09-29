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

    const topic = await prisma.topic.findUnique({
      where: { id: topicId },
      include: { vocabulary: true }
    });

    if (!topic) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json(topic);
  } catch (error) {
    console.error('Error in GET /api/projects/[projectId]/topics/[topicId]:', error);
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
    const topic = await prisma.topic.update({
      where: { id: topicId },
      data: { title: body.title }
    });

    return NextResponse.json(topic);
  } catch (error) {
    console.error('Error in PATCH /api/projects/[projectId]/topics/[topicId]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ projectId: string; topicId: string }> }) {
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

    await prisma.vocabulary.deleteMany({ where: { topicId } });
    await prisma.topic.delete({ where: { id: topicId } });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Error in DELETE /api/projects/[projectId]/topics/[topicId]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
