// Common types for API server

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  offset?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    name?: string | null;
  };
}

// JWT Payload
export interface JWTPayload {
  id: string;
  email: string;
  name?: string;
  iat?: number;
  exp?: number;
}

// Database models (matching Prisma schema)
export interface User {
  id: string;
  email: string;
  name: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Project {
  id: string;
  title: string;
  description: string | null;
  ownerId: string;
  createdAt: Date;
  owner?: User;
  topics?: Topic[];
}

export interface Topic {
  id: string;
  title: string;
  projectId: string;
  createdAt: Date;
  project?: Project;
  vocabulary?: Vocabulary[];
}

export interface Vocabulary {
  id: string;
  kanji: string | null;
  kana: string | null;
  meaning: string;
  image: string | null;
  type: number;
  status: string;
  topicId: string;
  createdAt: Date;
  topic?: Topic;
}

// Request/Response types for API endpoints
export interface CreateProjectRequest {
  title: string;
  description?: string;
}

export interface UpdateProjectRequest extends CreateProjectRequest {
  id: string;
}

export interface CreateTopicRequest {
  title: string;
  projectId: string;
}

export interface CreateVocabularyRequest {
  kanji?: string;
  kana?: string;
  meaning: string;
  image?: string;
  type?: number;
  topicId: string;
}

export interface UpdateVocabularyRequest extends CreateVocabularyRequest {
  id: string;
  status?: string;
}

// Sync types
export interface SyncRequest {
  lastSyncTimestamp?: number;
  changes: {
    projects?: Project[];
    topics?: Topic[];
    vocabulary?: Vocabulary[];
  };
}

export interface SyncResponse {
  success: boolean;
  lastSyncTimestamp: number;
  changes: {
    projects?: Project[];
    topics?: Topic[];
    vocabulary?: Vocabulary[];
  };
}

// Error types
export class ApiError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'ApiError';
  }
}

export class ValidationError extends ApiError {
  constructor(message: string, errors?: any) {
    super(message, 400);
    this.name = 'ValidationError';
  }
}

export class UnauthorizedError extends ApiError {
  constructor(message: string = 'Unauthorized') {
    super(message, 401);
    this.name = 'UnauthorizedError';
  }
}

export class NotFoundError extends ApiError {
  constructor(message: string = 'Resource not found') {
    super(message, 404);
    this.name = 'NotFoundError';
  }
}