import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCachedOrFetch, invalidateCache } from "@/lib/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";


export async function GET(
  req: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { projectId } = await params;

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

    const cacheKey = `topics:${projectId}`;

    const results = await getCachedOrFetch(
      cacheKey,
      async () => {
        // Return lightweight topics for a project with per-topic vocabulary counts
        const topics = await prisma.topic.findMany({
          where: { projectId },
          select: {
            id: true,
            title: true,
            createdAt: true,
            _count: { select: { vocabulary: true } }
          }
        });

        return topics.map((t) => ({
          id: t.id,
          title: t.title,
          wordsCount: (t as any)._count?.vocabulary ?? 0
        }));
      },
      600 // 10 minutes TTL
    );

    return NextResponse.json(results);
  } catch (error) {
    console.error('Error in GET /api/projects/[projectId]/topics:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { projectId } = await params;

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
    const topic = await prisma.topic.create({
      data: { title: body.title, projectId }
    });

    // Invalidate caches
    await invalidateCache(`topics:${projectId}`, `projects:list:${user.id}`, `project:${projectId}`);

    return NextResponse.json(topic, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/projects/[projectId]/topics:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
