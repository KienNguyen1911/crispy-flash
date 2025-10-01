# Crispy Flash API Server

Standalone API server for Crispy Flash mobile application with Capacitor.

## 🚀 Features

- **Express.js** based REST API
- **JWT Authentication** for mobile apps
- **Prisma ORM** for database operations
- **Offline-First Support** with sync endpoints
- **TypeScript** for type safety
- **CORS** configured for mobile app access

## 📋 Prerequisites

- Node.js 18+
- PostgreSQL database
- Prisma CLI

## 🛠️ Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env
   ```

   Edit `.env` with your database URL and JWT secret:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/crispyflash?schema=public"
   JWT_SECRET="your-super-secret-jwt-key-here"
   PORT=3001
   ```

3. **Setup database:**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

## 🏃‍♂️ Running

### Development mode:
```bash
npm run dev
```

### Production mode:
```bash
npm run build
npm start
```

Server will start on `http://localhost:3001`

## 🔗 API Endpoints

### Health Check
- `GET /health` - Server health status

### Authentication
- `POST /api/auth/google` - Exchange Google token for JWT
- `POST /api/auth/refresh` - Refresh JWT token
- `GET /api/auth/me` - Get current user info

### Projects
- `GET /api/projects` - List user's projects
- `POST /api/projects` - Create new project
- `GET /api/projects/:id` - Get specific project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

### Topics
- `GET /api/topics/:projectId` - Get topics for project
- `POST /api/topics/:projectId` - Create new topic
- `GET /api/topics/:projectId/:topicId` - Get specific topic
- `PUT /api/topics/:projectId/:topicId` - Update topic
- `DELETE /api/topics/:projectId/:topicId` - Delete topic

### Vocabulary
- `GET /api/vocabulary/:topicId` - Get vocabulary for topic
- `POST /api/vocabulary/:topicId` - Create vocabulary (single/bulk)
- `GET /api/vocabulary/:topicId/:vocabularyId` - Get specific vocabulary
- `PUT /api/vocabulary/:topicId/:vocabularyId` - Update vocabulary
- `DELETE /api/vocabulary/:topicId/:vocabularyId` - Delete vocabulary
- `PATCH /api/vocabulary/:topicId` - Update multiple vocabulary statuses

### Sync (Offline-First)
- `GET /api/sync/changes?since=timestamp` - Get changes since timestamp
- `POST /api/sync/upload` - Upload local changes to server
- `POST /api/sync/download` - Download server changes
- `GET /api/sync/status` - Get sync status for user

## 🔐 Authentication

All API endpoints (except auth endpoints) require JWT token in Authorization header:

```
Authorization: Bearer <jwt_token>
```

## 📱 Mobile Integration

This API server is designed to work with Capacitor mobile apps:

1. **Google OAuth**: Use `@capacitor/google-auth` plugin
2. **JWT Storage**: Use `@capacitor/preferences` to store tokens
3. **Network Status**: Monitor with `@capacitor/network`
4. **Background Sync**: Use sync endpoints for offline-first functionality

## 🧪 Testing

Test the API server with curl:

```bash
# Health check
curl http://localhost:3001/health

# Get projects (replace TOKEN with actual JWT)
curl -H "Authorization: Bearer TOKEN" http://localhost:3001/api/projects
```

## 🚀 Deployment

For production deployment:

1. Set `NODE_ENV=production` in environment
2. Use a process manager like PM2
3. Configure reverse proxy (nginx)
4. Set up SSL certificate
5. Configure database connection

## 📁 Project Structure

```
api-server/
├── src/
│   ├── index.ts           # Main server file
│   ├── middleware/
│   │   └── auth.ts        # JWT authentication middleware
│   ├── routes/
│   │   ├── auth.ts        # Authentication routes
│   │   ├── projects.ts    # Project CRUD routes
│   │   ├── topics.ts      # Topic CRUD routes
│   │   ├── vocabulary.ts  # Vocabulary CRUD routes
│   │   └── sync.ts        # Sync routes for offline-first
│   ├── types/
│   │   └── index.ts       # TypeScript type definitions
│   └── utils/
│       └── response.ts    # Response utility functions
├── prisma/
│   └── schema.prisma      # Database schema (shared with main app)
└── package.json