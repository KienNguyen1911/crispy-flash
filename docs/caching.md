# Caching Implementation with SWR

## Overview
This project uses SWR (SWR: React Hooks for Data Fetching) to implement caching for API requests, significantly improving page load times and user experience.

## What is SWR?
SWR is a React hooks library for data fetching that provides:
- **Caching**: Automatically caches API responses
- **Revalidation**: Refreshes data in the background
- **Error Handling**: Built-in error states
- **Loading States**: Automatic loading indicators
- **Optimistic Updates**: Update UI immediately while syncing with server

## Configuration
SWR is configured in `src/app/providers.tsx` with the following settings:
- `fetcher`: Default fetch function that parses JSON responses
- `revalidateOnFocus`: Disabled to prevent unnecessary requests when window regains focus
- `revalidateOnReconnect`: Enabled to refresh data when network reconnects
- `dedupingInterval`: 5 seconds - prevents duplicate requests within this timeframe

## Usage in Components

### Basic Usage
```typescript
import useSWR from 'swr';

function MyComponent() {
  const { data, error, isLoading } = useSWR('/api/data');

  if (error) return <div>Error loading data</div>;
  if (isLoading) return <div>Loading...</div>;

  return <div>{data}</div>;
}
```

### With Custom Fetcher
```typescript
const { data } = useSWR('/api/data', (url) =>
  fetch(url).then(res => res.json())
);
```

### Manual Revalidation
```typescript
const { data, mutate } = useSWR('/api/data');

// Refresh data
mutate();

// Update with new data
mutate(newData, false); // false = don't revalidate
```

## Implemented Pages

### Project Page (`src/app/projects/[projectId]/page.tsx`)
- Caches project data
- Caches topics list
- Parallel loading of both datasets
- Automatic revalidation on revisit

### Topic Page (`src/app/projects/[projectId]/topics/[topicId]/page.tsx`)
- Caches project data
- Caches topic data with vocabulary
- Parallel loading
- Error handling with 404 redirects

## Benefits
1. **Faster Navigation**: Cached data loads instantly on page revisits
2. **Reduced API Calls**: Prevents duplicate requests within deduping interval
3. **Better UX**: Loading states and error handling
4. **Automatic Updates**: Background revalidation keeps data fresh
5. **Optimistic Updates**: UI updates immediately, syncs in background

## Cache Management
- **Frontend**: Data is cached per URL key with SWR
- **Backend**: Redis-based caching for database queries (5-minute TTL)
- Cache persists across sessions with Redis
- Automatic cleanup of stale data
- Manual invalidation on data mutations

## Error Handling
- 404 errors redirect to `notFound()`
- Network errors show error states
- Automatic retry on reconnect

## Backend Caching with Redis
Added Redis-based caching for Prisma queries to reduce database load:
- **Implementation**: Custom caching in API routes using Upstash Redis
- **Cached Routes** (when Redis is configured):
  - `GET /api/projects` - Projects list with counts
  - `GET /api/projects/[projectId]` - Individual project details
  - `GET /api/projects/[projectId]/topics` - Topics list for project
- **Cache Strategy**: Check Redis first, fallback to database, cache results with 10-minute TTL
- **Invalidation**: Automatic cache clearing on data mutations (POST/PATCH/DELETE)
  - Creating/updating projects invalidates projects list
  - Creating topics invalidates projects list, project details, and topics list
- **Environment**: Uses Vercel's integrated Upstash Redis (free tier)
- **Graceful Degradation**: App works without Redis - caching is optional

### Setup Requirements
1. Enable Upstash Redis in Vercel dashboard
2. Add environment variables:
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`

## Performance Improvements
- Page loads reduced from ~2s to near-instant for cached data
- Parallel API calls instead of sequential
- Reduced server load through request deduplication
- Background revalidation keeps cache fresh without blocking UI
- Database query caching minimizes Supabase hits (10-minute TTL)