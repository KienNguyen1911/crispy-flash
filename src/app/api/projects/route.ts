import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';

export async function GET() {
  const projects = await prisma.project.findMany({ include: { topics: { include: { vocabulary: true } } } });
  return NextResponse.json(projects);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data: any = { title: body.title, description: body.description || '' };
    // try to attach owner from session if available
    try {
      const session = await getServerSession(authOptions as any) as any;
      if (session?.user?.email) {
        // find or create user by email
        const user = await prisma.user.upsert({ where: { email: session.user.email }, update: {}, create: { email: session.user.email, name: session.user.name || undefined } });
        data.ownerId = user.id;
      } else if (body.ownerId) {
        data.ownerId = body.ownerId;
      }
    } catch (e) {
      // ignore session errors and fallback to body.ownerId if provided
      if (body.ownerId) data.ownerId = body.ownerId;
    }
    const project = await prisma.project.create({ data });
    return NextResponse.json(project, { status: 201 });
  } catch (err: any) {
    console.error('Create project error', err);
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 });
  }
}
