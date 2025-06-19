import { Logger } from "./logger.js";

interface RetryOptions {
  maxAttempts: number;
  baseDelay: number;
  maxDelay: number;
}

/**
 * Helper class for implementing retry logic
 */
export class RetryHelper {
  /**
   * Retry an API call with exponential backoff
   */
  static async retryApiCall<T>(
    operation: () => Promise<T>,
    options: RetryOptions,
    operationName: string
  ): Promise<T> {
    const { maxAttempts, baseDelay, maxDelay } = options;
    let lastError: Error = new Error("Unknown error");

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        if (attempt === maxAttempts) {
          Logger.error(
            `${operationName} failed after ${maxAttempts} attempts`,
            lastError.message
          );
          throw lastError;
        }

        const delay = Math.min(baseDelay * Math.pow(2, attempt - 1), maxDelay);
        Logger.warn(
          `${operationName} attempt ${attempt} failed, retrying in ${delay}ms`,
          lastError.message
        );
        await this.delay(delay);
      }
    }

    throw lastError;
  }

  private static delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
