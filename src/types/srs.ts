export interface SrsData {
  interval: number;
  repetitions: number;
  easinessFactor: number;
  nextReviewDate: Date;
  lastReviewDate: Date | null;
  isReviewed: boolean;
}

export interface ReviewFeedbackDto {
  quality: number; // 0-5
  timeSpent?: number;
  status: 'UNKNOWN' | 'REMEMBERED' | 'NOT_REMEMBERED';
}

export interface VocabularyWithSrs {
  id: string;
  word: string;
  meaning: string;
  pronunciation?: string;
  example?: string;
  topicId: string;
  srsData: SrsData;
}

export interface DueReviewCount {
  count: number;
  dueToday: number;
  overdue: number;
}