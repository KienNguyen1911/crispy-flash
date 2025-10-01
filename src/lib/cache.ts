import { Redis } from '@upstash/redis';

const redis = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
  : null;

export async function getCachedOrFetch<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = 300
): Promise<T> {
  if (!redis) {
    return await fetcher();
  }
  try {
    const cached = await redis.get<string>(key);
    if (cached) {
      try {
        return JSON.parse(cached) as T;
      } catch {
        // Fallback if value was stored as plain string
        return cached as unknown as T;
      }
    }
  } catch {
    // ignore cache read errors
  }
  const data = await fetcher();
  try {
    await redis.setex(key, ttl, JSON.stringify(data));
  } catch {
    // ignore cache write errors
  }
  return data;
}

export async function invalidateCache(...keys: string[]) {
  if (!redis || keys.length === 0) return;
  try {
    await redis.del(...keys);
  } catch {
    // ignore cache delete errors
  }
}