import { Router, Request, Response } from 'express';
import { prisma } from '../index';
import { authenticateToken } from '../middleware/auth';
import { sendSuccess, sendError, asyncHandler } from '../utils/response';
import { CreateTopicRequest } from '../types';

const router = Router();

// GET /api/topics/:projectId - Get topics for a project
router.get('/:projectId', authenticateToken, asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { projectId } = req.params;

  // Check project ownership
  const project = await prisma.project.findFirst({
    where: { id: projectId, ownerId: userId }
  });

  if (!project) {
    return sendError(res, 'Project not found', 404);
  }

  // Get topics with vocabulary counts
  const topics = await prisma.topic.findMany({
    where: { projectId },
    select: {
      id: true,
      title: true,
      createdAt: true,
      _count: { select: { vocabulary: true } }
    },
    orderBy: { createdAt: 'desc' }
  });

  // Transform data to match expected format
  const transformedTopics = topics.map((topic) => ({
    id: topic.id,
    title: topic.title,
    wordsCount: (topic as any)._count?.vocabulary ?? 0,
    createdAt: topic.createdAt
  }));

  sendSuccess(res, transformedTopics);
}));

// POST /api/topics/:projectId - Create new topic
router.post('/:projectId', authenticateToken, asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { projectId } = req.params;
  const { title }: CreateTopicRequest = req.body;

  if (!title) {
    return sendError(res, 'Title is required', 400);
  }

  // Check project ownership
  const project = await prisma.project.findFirst({
    where: { id: projectId, ownerId: userId }
  });

  if (!project) {
    return sendError(res, 'Project not found', 404);
  }

  const topic = await prisma.topic.create({
    data: {
      title,
      projectId
    }
  });

  sendSuccess(res, topic, 'Topic created successfully', 201);
}));

// GET /api/topics/:projectId/:topicId - Get specific topic
router.get('/:projectId/:topicId', authenticateToken, asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { projectId, topicId } = req.params;

  // Check project ownership
  const project = await prisma.project.findFirst({
    where: { id: projectId, ownerId: userId }
  });

  if (!project) {
    return sendError(res, 'Project not found', 404);
  }

  const topic = await prisma.topic.findFirst({
    where: {
      id: topicId,
      projectId
    },
    include: {
      vocabulary: {
        select: {
          id: true,
          kanji: true,
          kana: true,
          meaning: true,
          image: true,
          type: true,
          status: true,
          createdAt: true
        }
      }
    }
  });

  if (!topic) {
    return sendError(res, 'Topic not found', 404);
  }

  sendSuccess(res, topic);
}));

// PUT /api/topics/:projectId/:topicId - Update topic
router.put('/:projectId/:topicId', authenticateToken, asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { projectId, topicId } = req.params;
  const { title }: CreateTopicRequest = req.body;

  if (!title) {
    return sendError(res, 'Title is required', 400);
  }

  // Check project ownership
  const project = await prisma.project.findFirst({
    where: { id: projectId, ownerId: userId }
  });

  if (!project) {
    return sendError(res, 'Project not found', 404);
  }

  const updatedTopic = await prisma.topic.update({
    where: { id: topicId },
    data: {
      title
    }
  });

  sendSuccess(res, updatedTopic, 'Topic updated successfully');
}));

// DELETE /api/topics/:projectId/:topicId - Delete topic
router.delete('/:projectId/:topicId', authenticateToken, asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { projectId, topicId } = req.params;

  // Check project ownership
  const project = await prisma.project.findFirst({
    where: { id: projectId, ownerId: userId }
  });

  if (!project) {
    return sendError(res, 'Project not found', 404);
  }

  await prisma.topic.delete({
    where: { id: topicId }
  });

  sendSuccess(res, null, 'Topic deleted successfully');
}));

export default router;