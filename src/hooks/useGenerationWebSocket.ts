import { useEffect } from 'react';
import { io, Socket } from 'socket.io-client';

interface GenerationEvent {
  status: 'completed' | 'failed' | 'generating' | 'retrying';
  topicId: string;
  content?: any;
  error?: string;
  progress?: number;
  attempt?: number;
  maxAttempts?: number;
  message?: string;
  timestamp: string;
}

export function useGenerationWebSocket(
  userId: string | undefined,
  topicId: string,
  onComplete: (content: any) => void,
  onError: (error: string) => void,
  onProgress?: (progress: number) => void,
  onRetry?: (attempt: number, maxAttempts: number, message: string) => void,
) {
  useEffect(() => {
    if (!userId) return;

    const socket: Socket = io(
      process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
      {
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5,
      },
    );

    socket.on('connect', () => {
      console.log('[WebSocket] Connected');
      socket.emit('subscribe-generation', { topicId, userId });
    });

    socket.on('generation-complete', (data: GenerationEvent) => {
      console.log('[WebSocket] Generation completed:', data);
      onComplete(data.content);
    });

    socket.on('generation-error', (data: GenerationEvent) => {
      console.log('[WebSocket] Generation error:', data);
      onError(data.error || 'Unknown error');
    });

    socket.on('generation-progress', (data: GenerationEvent) => {
      console.log('[WebSocket] Generation progress:', data);
      onProgress?.(data.progress || 0);
    });

    socket.on('generation-retry', (data: GenerationEvent) => {
      console.log('[WebSocket] Generation retrying:', data);
      onRetry?.(data.attempt || 0, data.maxAttempts || 0, data.message || 'AI đang quá tải, vui lòng đợi…');
    });

    socket.on('disconnect', () => {
      console.log('[WebSocket] Disconnected');
    });

    socket.on('error', (error: unknown) => {
      console.error('[WebSocket] Error:', error);
    });

    return () => {
      socket.emit('unsubscribe-generation', { topicId, userId });
      socket.disconnect();
    };
  }, [userId, topicId, onComplete, onError, onProgress, onRetry]);
}
