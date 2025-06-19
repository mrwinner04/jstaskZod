// Retry configuration
export interface RetryConfig {
  maxAttempts: number;
  baseDelay: number;
  maxDelay?: number;
}

// Cache keys
export interface CacheKeys {
  USERS: string;
  WEATHER: string;
  LAST_FETCH: string;
}
