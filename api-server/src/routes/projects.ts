import { Router, Request, Response } from 'express';
import { prisma } from '../index';
import { authenticateToken } from '../middleware/auth';
import { sendSuccess, sendError, asyncHandler } from '../utils/response';
import { CreateProjectRequest } from '../types';

const router = Router();

// GET /api/projects - List all projects for authenticated user
router.get('/', authenticateToken, asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;

  // Return lightweight project list: id/title/description with counts only, filtered by owner
  const projects = await prisma.project.findMany({
    where: { ownerId: userId },
    select: {
      id: true,
      title: true,
      description: true,
      _count: { select: { topics: true } },
      topics: { select: { _count: { select: { vocabulary: true } } } }
    }
  });

  // compute wordsCount per project by summing vocabulary counts from topics
  const transformedProjects = projects.map((p) => {
    const wordsCount = p.topics.reduce((sum: number, t: any) => sum + (t._count?.vocabulary ?? 0), 0);
    return {
      id: p.id,
      title: p.title,
      description: p.description,
      topicsCount: p._count?.topics ?? 0,
      wordsCount,
    };
  });

  sendSuccess(res, transformedProjects);
}));

// POST /api/projects - Create new project
router.post('/', authenticateToken, asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { title, description }: CreateProjectRequest = req.body;

  if (!title) {
    return sendError(res, 'Title is required', 400);
  }

  const project = await prisma.project.create({
    data: {
      title,
      description: description || '',
      ownerId: userId
    }
  });

  sendSuccess(res, project, 'Project created successfully', 201);
}));

// GET /api/projects/:id - Get specific project
router.get('/:id', authenticateToken, asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { id } = req.params;

  const project = await prisma.project.findFirst({
    where: {
      id,
      ownerId: userId
    },
    include: {
      topics: {
        include: {
          _count: {
            select: { vocabulary: true }
          }
        }
      }
    }
  });

  if (!project) {
    return sendError(res, 'Project not found', 404);
  }

  // Transform topics data
  const transformedProject = {
    ...project,
    topics: project.topics.map(topic => ({
      id: topic.id,
      title: topic.title,
      wordsCount: (topic as any)._count?.vocabulary ?? 0,
      createdAt: topic.createdAt
    }))
  };

  sendSuccess(res, transformedProject);
}));

// PUT /api/projects/:id - Update project
router.put('/:id', authenticateToken, asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { id } = req.params;
  const { title, description }: CreateProjectRequest = req.body;

  if (!title) {
    return sendError(res, 'Title is required', 400);
  }

  // Check ownership
  const existingProject = await prisma.project.findFirst({
    where: { id, ownerId: userId }
  });

  if (!existingProject) {
    return sendError(res, 'Project not found', 404);
  }

  const updatedProject = await prisma.project.update({
    where: { id },
    data: {
      title,
      description: description || ''
    }
  });

  sendSuccess(res, updatedProject, 'Project updated successfully');
}));

// DELETE /api/projects/:id - Delete project
router.delete('/:id', authenticateToken, asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { id } = req.params;

  // Check ownership
  const existingProject = await prisma.project.findFirst({
    where: { id, ownerId: userId }
  });

  if (!existingProject) {
    return sendError(res, 'Project not found', 404);
  }

  await prisma.project.delete({
    where: { id }
  });

  sendSuccess(res, null, 'Project deleted successfully');
}));

export default router;