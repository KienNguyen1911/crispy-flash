export interface ReviewFeedbackDto {
  quality: number; // 0-5
  status: 'UNKNOWN' | 'REMEMBERED' | 'NOT_REMEMBERED';
  promptType: 'WORD_TO_MEANING' | 'WORD_TO_READING';
  result: 'CORRECT' | 'INCORRECT' | 'TIMEOUT';
  responseTimeMs?: number;
  sessionKey?: string;
}

export interface VocabularyWithSrs {
  id: string;
  word: string | null;
  meaning: string;
  pronunciation?: string | null;
  example?: string;
  example_sentences?: string | null;
  part_of_speech?: string | null;
  topicId: string;
  interval: number;
  easinessFactor: number;
  nextReviewDate: string | Date | null;
  lastReviewDate: string | Date | null;
  weakScore?: number;
  weakLevel?: 'NONE' | 'NEEDS_REVIEW' | 'HIGH_RISK';
  promptType?: 'WORD_TO_MEANING' | 'WORD_TO_READING';
  answerOptions?: string[];
  promptQuestion?: string;
  promptContext?: string | null;
  correctAnswer?: string;
  readingForms?: { surfaceReading: string; surfaceWord: string; okuriganaSuffix: string; hasOkurigana: boolean; kanjiCount: number; readingType: 'KANJI_OKURIGANA' | 'COMPOUND_KANJI' | 'HIRAGANA_ONLY' | 'OTHER'; candidateKanjiReadings: { kanji: string; readings: string[] }[]; requiresContext: boolean } | null;
}

export interface DueReviewCount {
  count: number;
  dueToday: number;
  overdue: number;
}

export interface DailyReviewSummary {
  date: string;
  reviewedCount: number;
  correctCount: number;
  incorrectCount: number;
  timeoutCount: number;
  slowCount: number;
  weakWordCount: number;
}

export interface DailyReviewHistoryItem {
  vocabularyId: string;
  word: string | null;
  meaning: string;
  pronunciation: string | null;
  reviewedAt: string | Date;
  result: 'CORRECT' | 'INCORRECT' | 'TIMEOUT';
  responseTimeMs: number | null;
  isSlow: boolean;
}

export interface WeakWordItem {
  id: string;
  word: string | null;
  meaning: string;
  pronunciation: string | null;
  weakScore: number;
  weakLevel: 'NONE' | 'NEEDS_REVIEW' | 'HIGH_RISK';
  recentIncorrectCount7d: number;
  recentTimeoutCount7d: number;
  recentSlowCount7d: number;
  lastReviewResult: 'CORRECT' | 'INCORRECT' | 'TIMEOUT' | null;
  nextReviewDate: string | Date | null;
  reasons: string[];
}

export type ReviewAttemptResult = 'CORRECT' | 'INCORRECT' | 'TIMEOUT';
