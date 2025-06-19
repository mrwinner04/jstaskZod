import { Logger } from "./logger.js";

export class APIHelper {
  /**
   * Fetch data from API with error handling and type safety
   */
  static async fetchData<T>(
    url: string,
    errorMessage: string = "Failed to fetch data"
  ): Promise<T> {
    try {
      const response = await fetch(url);

      if (!response.ok) {
        const errorDetails = `HTTP ${response.status}: ${response.statusText}`;
        Logger.error(`${errorMessage} - ${errorDetails}`);
        throw new Error(`${errorMessage}: ${errorDetails}`);
      }

      const data = await response.json();
      return data as T;
    } catch (error) {
      const errorInstance =
        error instanceof Error ? error : new Error(String(error));
      Logger.error(`${errorMessage}:`, errorInstance.message);
      throw errorInstance;
    }
  }

  /**
   * Validate data with a custom validation function
   */
  static validateData<T>(
    data: T,
    validator: (data: T) => boolean,
    errorMessage: string = "Data validation failed"
  ): void {
    if (!validator(data)) {
      Logger.error(errorMessage);
      throw new Error(errorMessage);
    }
  }

  /**
   * Handle API errors with retry logic
   */
  static async handleApiError(
    error: Error | string,
    retryCount: number
  ): Promise<void> {
    if (retryCount > 0) {
      const delay = Math.min(1000 * Math.pow(2, 3 - retryCount), 5000);
      const errorMessage = error instanceof Error ? error.message : error;
      Logger.warn(
        `Retrying in ${delay}ms... (${retryCount} attempts remaining)`,
        errorMessage
      );
      await new Promise((resolve) => setTimeout(resolve, delay));
    } else {
      throw error;
    }
  }
}
