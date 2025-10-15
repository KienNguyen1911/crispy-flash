/**
 * Global constants for the application
 */

// Toast notification durations (in milliseconds)
export const TOAST_DURATION = 3000; // 3 seconds
export const TOAST_REMOVE_DELAY = 1000000; // 1000 seconds (from use-toast)

// API configuration
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Pagination
export const DEFAULT_PAGE_SIZE = 10;

// Date/time formats
export const DATE_FORMAT = 'yyyy-MM-dd';
export const DATETIME_FORMAT = 'yyyy-MM-dd HH:mm:ss';

// Local storage keys
export const LOCAL_STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER_PREFERENCES: 'user_preferences',
  THEME: 'theme',
} as const;

// Session configuration
export const SESSION_CONFIG = {
  MAX_IDLE_TIME: 30 * 60 * 1000, // 30 minutes
  WARNING_TIME: 5 * 60 * 1000, // 5 minutes warning
} as const;

// UI configuration
export const UI_CONFIG = {
  ANIMATION_DURATION: 300, // milliseconds
  DEBOUNCE_DELAY: 300, // milliseconds
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  SUPPORTED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
} as const;