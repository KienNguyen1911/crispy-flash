import { Router, Request, Response } from 'express';
import { prisma } from '../index';
import { authenticateToken } from '../middleware/auth';
import { sendSuccess, sendError, asyncHandler } from '../utils/response';
import { SyncRequest, SyncResponse } from '../types';

const router = Router();

// GET /api/sync/changes - Get changes since last sync
router.get('/changes', authenticateToken, asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const since = parseInt(req.query.since as string) || 0;

  try {
    const sinceDate = new Date(since);

    // Get projects changes (using createdAt as fallback since no updatedAt field)
    const projects = await prisma.project.findMany({
      where: {
        ownerId: userId,
        createdAt: { gte: sinceDate }
      }
    });

    // Get topics changes (using createdAt as fallback since no updatedAt field)
    const topics = await prisma.topic.findMany({
      where: {
        project: {
          ownerId: userId
        },
        createdAt: { gte: sinceDate }
      }
    });

    // Get vocabulary changes (using createdAt as fallback since no updatedAt field)
    const vocabulary = await prisma.vocabulary.findMany({
      where: {
        topic: {
          project: {
            ownerId: userId
          }
        },
        createdAt: { gte: sinceDate }
      }
    });

    const response: SyncResponse = {
      success: true,
      lastSyncTimestamp: Date.now(),
      changes: {
        projects,
        topics,
        vocabulary
      }
    };

    sendSuccess(res, response);
  } catch (error) {
    console.error('Sync changes error:', error);
    sendError(res, 'Failed to get changes', 500);
  }
}));

// POST /api/sync/upload - Upload local changes to server
router.post('/upload', authenticateToken, asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { projects, topics, vocabulary }: SyncRequest['changes'] = req.body;

  try {
    // Upsert projects
    if (projects && projects.length > 0) {
      for (const project of projects) {
        await prisma.project.upsert({
          where: { id: project.id },
          update: {
            title: project.title,
            description: project.description
          },
          create: {
            id: project.id,
            title: project.title,
            description: project.description,
            ownerId: userId
          }
        });
      }
    }

    // Upsert topics
    if (topics && topics.length > 0) {
      for (const topic of topics) {
        await prisma.topic.upsert({
          where: { id: topic.id },
          update: {
            title: topic.title
          },
          create: {
            id: topic.id,
            title: topic.title,
            projectId: topic.projectId
          }
        });
      }
    }

    // Upsert vocabulary
    if (vocabulary && vocabulary.length > 0) {
      for (const vocab of vocabulary) {
        await prisma.vocabulary.upsert({
          where: { id: vocab.id },
          update: {
            kanji: vocab.kanji,
            kana: vocab.kana,
            meaning: vocab.meaning,
            image: vocab.image,
            type: vocab.type,
            status: vocab.status
          },
          create: {
            id: vocab.id,
            kanji: vocab.kanji,
            kana: vocab.kana,
            meaning: vocab.meaning,
            image: vocab.image,
            type: vocab.type,
            status: vocab.status,
            topicId: vocab.topicId
          }
        });
      }
    }

    sendSuccess(res, {
      uploaded: {
        projects: projects?.length || 0,
        topics: topics?.length || 0,
        vocabulary: vocabulary?.length || 0
      }
    }, 'Changes uploaded successfully');
  } catch (error) {
    console.error('Sync upload error:', error);
    sendError(res, 'Failed to upload changes', 500);
  }
}));

// POST /api/sync/download - Download server changes (alias for /changes)
router.post('/download', authenticateToken, asyncHandler(async (req: Request, res: Response) => {
  // Redirect to GET /changes endpoint
  req.query.since = req.body.lastSyncTimestamp?.toString() || '0';
  // Call the changes endpoint logic
  const since = parseInt(req.query.since as string) || 0;

  try {
    const sinceDate = new Date(since);

    // Get projects changes
    const projects = await prisma.project.findMany({
      where: {
        ownerId: req.user!.id,
        createdAt: { gte: sinceDate }
      }
    });

    // Get topics changes
    const topics = await prisma.topic.findMany({
      where: {
        project: {
          ownerId: req.user!.id
        },
        createdAt: { gte: sinceDate }
      }
    });

    // Get vocabulary changes
    const vocabulary = await prisma.vocabulary.findMany({
      where: {
        topic: {
          project: {
            ownerId: req.user!.id
          }
        },
        createdAt: { gte: sinceDate }
      }
    });

    const response: SyncResponse = {
      success: true,
      lastSyncTimestamp: Date.now(),
      changes: {
        projects,
        topics,
        vocabulary
      }
    };

    sendSuccess(res, response);
  } catch (error) {
    console.error('Sync download error:', error);
    sendError(res, 'Failed to download changes', 500);
  }
}));

// GET /api/sync/status - Get sync status for user
router.get('/status', authenticateToken, asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;

  try {
    // Get latest update timestamps for each entity type
    const [latestProject, latestTopic, latestVocabulary] = await Promise.all([
      prisma.project.findFirst({
        where: { ownerId: userId },
        orderBy: { createdAt: 'desc' },
        select: { createdAt: true }
      }),
      prisma.topic.findFirst({
        where: {
          project: { ownerId: userId }
        },
        orderBy: { createdAt: 'desc' },
        select: { createdAt: true }
      }),
      prisma.vocabulary.findFirst({
        where: {
          topic: {
            project: { ownerId: userId }
          }
        },
        orderBy: { createdAt: 'desc' },
        select: { createdAt: true }
      })
    ]);

    // Get counts
    const [projectCount, topicCount, vocabularyCount] = await Promise.all([
      prisma.project.count({ where: { ownerId: userId } }),
      prisma.topic.count({
        where: { project: { ownerId: userId } }
      }),
      prisma.vocabulary.count({
        where: {
          topic: {
            project: { ownerId: userId }
          }
        }
      })
    ]);

    sendSuccess(res, {
      lastSyncTimestamp: Math.max(
        latestProject?.createdAt?.getTime() || 0,
        latestTopic?.createdAt?.getTime() || 0,
        latestVocabulary?.createdAt?.getTime() || 0
      ),
      counts: {
        projects: projectCount,
        topics: topicCount,
        vocabulary: vocabularyCount
      },
      latestUpdates: {
        projects: latestProject?.createdAt?.getTime() || 0,
        topics: latestTopic?.createdAt?.getTime() || 0,
        vocabulary: latestVocabulary?.createdAt?.getTime() || 0
      }
    });
  } catch (error) {
    console.error('Sync status error:', error);
    sendError(res, 'Failed to get sync status', 500);
  }
}));

export default router;