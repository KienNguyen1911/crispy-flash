import { Router, Request, Response } from 'express';
import { prisma } from '../index';
import { authenticateToken } from '../middleware/auth';
import { sendSuccess, sendError, asyncHandler } from '../utils/response';
import { CreateVocabularyRequest, UpdateVocabularyRequest } from '../types';

const router = Router();

// GET /api/vocabulary/:topicId - Get vocabulary for a topic
router.get('/:topicId', authenticateToken, asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { topicId } = req.params;

  // Check topic ownership through project
  const topic = await prisma.topic.findFirst({
    where: { id: topicId },
    include: { project: true }
  });

  if (!topic || topic.project.ownerId !== userId) {
    return sendError(res, 'Topic not found', 404);
  }

  const vocabulary = await prisma.vocabulary.findMany({
    where: { topicId },
    orderBy: { createdAt: 'desc' }
  });

  sendSuccess(res, vocabulary);
}));

// POST /api/vocabulary/:topicId - Create vocabulary (single or bulk)
router.post('/:topicId', authenticateToken, asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { topicId } = req.params;
  const body = req.body;

  // Check topic ownership through project
  const topic = await prisma.topic.findFirst({
    where: { id: topicId },
    include: { project: true }
  });

  if (!topic || topic.project.ownerId !== userId) {
    return sendError(res, 'Topic not found', 404);
  }

  // Handle bulk insert
  if (Array.isArray(body)) {
    if (body.length === 0) {
      return sendError(res, 'No vocabulary items provided', 400);
    }

    const vocabularyData = body.map((item: CreateVocabularyRequest) => ({
      kanji: item.kanji || null,
      kana: item.kana || null,
      meaning: item.meaning || '',
      image: item.image || null,
      type: item.type || 1,
      topicId
    }));

    const result = await prisma.vocabulary.createMany({
      data: vocabularyData
    });

    return sendSuccess(res, { created: result.count }, `${result.count} vocabulary items created`, 201);
  }

  // Handle single item
  const { kanji, kana, meaning, image, type }: CreateVocabularyRequest = body;

  if (!meaning) {
    return sendError(res, 'Meaning is required', 400);
  }

  const vocabularyItem = await prisma.vocabulary.create({
    data: {
      kanji: kanji || null,
      kana: kana || null,
      meaning,
      image: image || null,
      type: type || 1,
      topicId
    }
  });

  sendSuccess(res, vocabularyItem, 'Vocabulary item created', 201);
}));

// GET /api/vocabulary/:topicId/:vocabularyId - Get specific vocabulary item
router.get('/:topicId/:vocabularyId', authenticateToken, asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { topicId, vocabularyId } = req.params;

  // Check ownership through project
  const topic = await prisma.topic.findFirst({
    where: { id: topicId },
    include: { project: true }
  });

  if (!topic || topic.project.ownerId !== userId) {
    return sendError(res, 'Topic not found', 404);
  }

  const vocabularyItem = await prisma.vocabulary.findFirst({
    where: {
      id: vocabularyId,
      topicId
    }
  });

  if (!vocabularyItem) {
    return sendError(res, 'Vocabulary item not found', 404);
  }

  sendSuccess(res, vocabularyItem);
}));

// PUT /api/vocabulary/:topicId/:vocabularyId - Update vocabulary item
router.put('/:topicId/:vocabularyId', authenticateToken, asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { topicId, vocabularyId } = req.params;
  const { kanji, kana, meaning, image, type, status }: UpdateVocabularyRequest = req.body;

  // Check ownership through project
  const topic = await prisma.topic.findFirst({
    where: { id: topicId },
    include: { project: true }
  });

  if (!topic || topic.project.ownerId !== userId) {
    return sendError(res, 'Topic not found', 404);
  }

  const updateData: any = {
    updatedAt: new Date()
  };

  if (kanji !== undefined) updateData.kanji = kanji;
  if (kana !== undefined) updateData.kana = kana;
  if (meaning !== undefined) updateData.meaning = meaning;
  if (image !== undefined) updateData.image = image;
  if (type !== undefined) updateData.type = type;
  if (status !== undefined) updateData.status = status;

  const updatedVocabulary = await prisma.vocabulary.update({
    where: { id: vocabularyId },
    data: updateData
  });

  sendSuccess(res, updatedVocabulary, 'Vocabulary item updated');
}));

// DELETE /api/vocabulary/:topicId/:vocabularyId - Delete vocabulary item
router.delete('/:topicId/:vocabularyId', authenticateToken, asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { topicId, vocabularyId } = req.params;

  // Check ownership through project
  const topic = await prisma.topic.findFirst({
    where: { id: topicId },
    include: { project: true }
  });

  if (!topic || topic.project.ownerId !== userId) {
    return sendError(res, 'Topic not found', 404);
  }

  await prisma.vocabulary.delete({
    where: { id: vocabularyId }
  });

  sendSuccess(res, null, 'Vocabulary item deleted');
}));

// PATCH /api/vocabulary/:topicId - Update multiple vocabulary statuses
router.patch('/:topicId', authenticateToken, asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { topicId } = req.params;
  const { updates }: { updates: Array<{ id: string; status: string }> } = req.body;

  if (!Array.isArray(updates) || updates.length === 0) {
    return sendError(res, 'No updates provided', 400);
  }

  // Check topic ownership through project
  const topic = await prisma.topic.findFirst({
    where: { id: topicId },
    include: { project: true }
  });

  if (!topic || topic.project.ownerId !== userId) {
    return sendError(res, 'Topic not found', 404);
  }

  // Apply updates in a transaction
  const updateOperations = updates.map(update =>
    prisma.vocabulary.update({
      where: { id: update.id },
      data: { status: update.status, updatedAt: new Date() }
    })
  );

  try {
    const results = await prisma.$transaction(updateOperations);
    sendSuccess(res, { updated: results.length }, `${results.length} vocabulary items updated`);
  } catch (error) {
    console.error('Batch update error:', error);
    sendError(res, 'Failed to update vocabulary items', 500);
  }
}));

export default router;