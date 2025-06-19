import { Logger } from "./logger.js";

/**
 * Helper class for API operations
 */
export class APIHelper {
  /**
   * Fetch data from API with error handling
   */
  static async fetchData<T>(url: string, errorMessage: string): Promise<T> {
    try {
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data as T;
    } catch (error) {
      Logger.error(errorMessage, error);
      throw error;
    }
  }

  /**
   * Validate API response data
   */
  static validateData<T>(
    data: T,
    validator: (data: T) => boolean,
    errorMessage: string
  ): void {
    if (!validator(data)) {
      throw new Error(errorMessage);
    }
  }

  /**
   * Handle API errors with retry logic
   */
  static async handleApiError(
    error: unknown,
    retryCount: number
  ): Promise<void> {
    if (retryCount > 0) {
      const delay = Math.min(1000 * Math.pow(2, 3 - retryCount), 5000);
      Logger.warn(
        `Retrying in ${delay}ms... (${retryCount} attempts remaining)`,
        error
      );
      await new Promise((resolve) => setTimeout(resolve, delay));
    } else {
      throw error;
    }
  }
}
