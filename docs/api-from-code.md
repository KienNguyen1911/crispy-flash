# LinguaFlash API Inventory (source-of-truth from code)

This document is compiled directly from the Next.js route handlers under `src/app/api`. Each endpoint below links to the exact function in source for verification.

Authentication
- Auth provider: Google OAuth via NextAuth
- Source: [src/app/api/auth/[...nextauth]/route.ts](src/app/api/auth/[...nextauth]/route.ts:1)
- Methods: GET, POST (handled by NextAuth handler)
- Env required: NEXTAUTH_SECRET, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET

Caching
- Redis Upstash is used to cache selected endpoints (10 minutes TTL):
  - Projects list: [src/app/api/projects/route.ts](src/app/api/projects/route.ts:14)
  - Single project: [src/app/api/projects/[projectId]/route.ts](src/app/api/projects/[projectId]/route.ts:14)
  - Topics list by project: [src/app/api/projects/[projectId]/topics/route.ts](src/app/api/projects/[projectId]/topics/route.ts:14)

Notes
- All application endpoints require an authenticated session via getServerSession(authOptions).
- Ownership checks ensure the authenticated user only accesses their own resources.
- Status values for vocabulary: unknown | remembered | not_remembered
- Type for vocabulary defaults to 1

Base URL
- Local: http://localhost:3000
- Production: your Vercel domain (frontend). If you introduce a separate BE, point the frontend API base accordingly.

Projects

1) List Projects
- Method/Path: GET /api/projects
- Source: [src/app/api/projects/route.ts](src/app/api/projects/route.ts:14)
- Description: Returns a lightweight array of projects owned by the current user with topicsCount and wordsCount.
- Response sample:
  [
    { "id": "string", "title": "string", "description": "string", "topicsCount": 0, "wordsCount": 0 }
  ]

2) Create Project
- Method/Path: POST /api/projects
- Source: [src/app/api/projects/route.ts](src/app/api/projects/route.ts:81)
- Body:
  { "title": "string", "description": "string" }
- Response: Created Project object

3) Get Project by ID
- Method/Path: GET /api/projects/{projectId}
- Source: [src/app/api/projects/[projectId]/route.ts](src/app/api/projects/[projectId]/route.ts:14)
- Response: Project object (full record)

4) Update Project
- Method/Path: PATCH /api/projects/{projectId}
- Source: [src/app/api/projects/[projectId]/route.ts](src/app/api/projects/[projectId]/route.ts:79)
- Body:
  { "title": "string", "description": "string" }
- Response: Updated Project

5) Delete Project
- Method/Path: DELETE /api/projects/{projectId}
- Source: [src/app/api/projects/[projectId]/route.ts](src/app/api/projects/[projectId]/route.ts:132)
- Effect: Deletes project, its topics, and their vocabulary
- Response: { "ok": true }

Topics

6) List Topics in a Project
- Method/Path: GET /api/projects/{projectId}/topics
- Source: [src/app/api/projects/[projectId]/topics/route.ts](src/app/api/projects/[projectId]/topics/route.ts:14)
- Response: Array of { id, title, wordsCount }

7) Create Topic
- Method/Path: POST /api/projects/{projectId}/topics
- Source: [src/app/api/projects/[projectId]/topics/route.ts](src/app/api/projects/[projectId]/topics/route.ts:88)
- Body:
  { "title": "string" }
- Response: Created Topic

8) Get Topic (with Vocabulary)
- Method/Path: GET /api/projects/{projectId}/topics/{topicId}
- Source: [src/app/api/projects/[projectId]/topics/[topicId]/route.ts](src/app/api/projects/[projectId]/topics/[topicId]/route.ts:6)
- Response: Topic object with "vocabulary" array

9) Update Topic
- Method/Path: PATCH /api/projects/{projectId}/topics/{topicId}
- Source: [src/app/api/projects/[projectId]/topics/[topicId]/route.ts](src/app/api/projects/[projectId]/topics/[topicId]/route.ts:49)
- Body:
  { "title": "string" }
- Response: Updated Topic

10) Delete Topic
- Method/Path: DELETE /api/projects/{projectId}/topics/{topicId}
- Source: [src/app/api/projects/[projectId]/topics/[topicId]/route.ts](src/app/api/projects/[projectId]/topics/[topicId]/route.ts:89)
- Effect: Deletes topic and all its vocabulary
- Response: { "ok": true }

Vocabulary

11) List Vocabulary by Topic
- Method/Path: GET /api/projects/{projectId}/topics/{topicId}/vocabulary
- Source: [src/app/api/projects/[projectId]/topics/[topicId]/vocabulary/route.ts](src/app/api/projects/[projectId]/topics/[topicId]/vocabulary/route.ts:6)
- Response: Array of Vocabulary items

12) Create Vocabulary (single or bulk)
- Method/Path: POST /api/projects/{projectId}/topics/{topicId}/vocabulary
- Source: [src/app/api/projects/[projectId]/topics/[topicId]/vocabulary/route.ts](src/app/api/projects/[projectId]/topics/[topicId]/vocabulary/route.ts:41)
- Body (single):
  { "kanji": "string|null", "kana": "string|null", "meaning": "string", "image": "string|null", "type": 1 }
- Body (bulk):
  [
    { "kanji": "...", "kana": "...", "meaning": "...", "image": null, "type": 1 }
  ]
- Response (single): Created Vocabulary item
- Response (bulk): { "created": number }

13) Batch Update Vocabulary Status
- Method/Path: PATCH /api/projects/{projectId}/topics/{topicId}/vocabulary
- Source: [src/app/api/projects/[projectId]/topics/[topicId]/vocabulary/route.ts](src/app/api/projects/[projectId]/topics/[topicId]/vocabulary/route.ts:114)
- Body:
  { "updates": [ { "id": "string", "status": "remembered|not_remembered|unknown" } ] }
- Response:
  { "updated": number }

14) Update Single Vocabulary
- Method/Path: PATCH /api/projects/{projectId}/topics/{topicId}/vocabulary/{vocabId}
- Source: [src/app/api/projects/[projectId]/topics/[topicId]/vocabulary/[vocabId]/route.ts](src/app/api/projects/[projectId]/topics/[topicId]/vocabulary/[vocabId]/route.ts:6)
- Body: Partial Vocabulary fields to update
- Response: Updated Vocabulary item

15) Delete Single Vocabulary
- Method/Path: DELETE /api/projects/{projectId}/topics/{topicId}/vocabulary/{vocabId}
- Source: [src/app/api/projects/[projectId]/topics/[topicId]/vocabulary/[vocabId]/route.ts](src/app/api/projects/[projectId]/topics/[topicId]/vocabulary/[vocabId]/route.ts:42)
- Response: { "ok": true }

Error Semantics
- 401 Unauthorized: Missing or invalid session
- 403 Forbidden: Resource not owned by the user
- 404 Not Found: Resource does not exist
- 500 Internal Server Error: Unhandled errors

Compatibility Notes for Spring Boot Migration
- Keep the exact URL paths and payload shapes for a drop-in replacement.
- Implement ownership checks equivalent to current code (by userId/ownerId).
- Preserve bulk POST and batch PATCH behavior for vocabulary to maintain UI performance.
- Recreate Redis caches for the 3 cached endpoints with 600s TTL to match existing client expectations.