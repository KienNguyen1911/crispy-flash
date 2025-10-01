import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../index';
import { sendSuccess, sendError, asyncHandler } from '../utils/response';
import { generateToken } from '../middleware/auth';

const router = Router();

// POST /api/auth/google - Exchange Google token for JWT
router.post('/google', asyncHandler(async (req: Request, res: Response) => {
  const { token, serverAuthCode }: { token: string; serverAuthCode?: string } = req.body;

  if (!token) {
    return sendError(res, 'Google token is required', 400);
  }

  try {
    // Verify Google token (in production, verify with Google's servers)
    // For now, we'll trust the token and extract user info
    const googleUser = await verifyGoogleToken(token);

    if (!googleUser) {
      return sendError(res, 'Invalid Google token', 401);
    }

    // Find or create user
    let user = await prisma.user.findUnique({
      where: { email: googleUser.email }
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: googleUser.email,
          name: googleUser.name
        }
      });
    } else if (googleUser.name && user.name !== googleUser.name) {
      // Update name if changed
      user = await prisma.user.update({
        where: { id: user.id },
        data: { name: googleUser.name }
      });
    }

    // Generate JWT token
    const jwtToken = generateToken({
      id: user.id,
      email: user.email,
      name: user.name || undefined
    });

    sendSuccess(res, {
      token: jwtToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    }, 'Authentication successful', 200);

  } catch (error) {
    console.error('Google auth error:', error);
    sendError(res, 'Authentication failed', 500);
  }
}));

// POST /api/auth/refresh - Refresh JWT token
router.post('/refresh', asyncHandler(async (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return sendError(res, 'Token required', 401);
  }

  try {
    // Verify existing token
    const jwt = require('jsonwebtoken');
    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
      throw new Error('JWT_SECRET not configured');
    }

    const decoded = jwt.verify(token, jwtSecret) as any;

    // Get fresh user data
    const user = await prisma.user.findUnique({
      where: { id: decoded.id }
    });

    if (!user) {
      return sendError(res, 'User not found', 404);
    }

    // Generate new token
    const newToken = generateToken({
      id: user.id,
      email: user.email,
      name: user.name || undefined
    });

    sendSuccess(res, {
      token: newToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    }, 'Token refreshed successfully');

  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      sendError(res, 'Invalid token', 401);
    } else {
      console.error('Token refresh error:', error);
      sendError(res, 'Token refresh failed', 500);
    }
  }
}));

// GET /api/auth/me - Get current user info
router.get('/me', asyncHandler(async (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return sendError(res, 'Token required', 401);
  }

  try {
    const jwt = require('jsonwebtoken');
    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
      throw new Error('JWT_SECRET not configured');
    }

    const decoded = jwt.verify(token, jwtSecret) as any;

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, email: true, name: true, createdAt: true }
    });

    if (!user) {
      return sendError(res, 'User not found', 404);
    }

    sendSuccess(res, { user });

  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      sendError(res, 'Invalid token', 401);
    } else {
      console.error('Get user error:', error);
      sendError(res, 'Failed to get user info', 500);
    }
  }
}));

// Helper function to verify Google token
async function verifyGoogleToken(token: string): Promise<{ email: string; name?: string } | null> {
  try {
    // In production, you should verify this token with Google's servers
    // For now, we'll decode it (this is not secure for production!)
    const jwt = require('jsonwebtoken');

    // Google tokens are JWTs, but we need to decode them carefully
    // This is a simplified version - in production use Google's auth library
    const decoded = jwt.decode(token) as any;

    if (!decoded || !decoded.email) {
      return null;
    }

    return {
      email: decoded.email,
      name: decoded.name || decoded.given_name + ' ' + decoded.family_name
    };
  } catch (error) {
    console.error('Token verification error:', error);
    return null;
  }
}

export default router;