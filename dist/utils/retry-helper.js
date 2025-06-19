import { Logger } from "./logger.js";
/**
 * Helper class for implementing retry logic
 */
export class RetryHelper {
    /**
     * Retry an API call with exponential backoff
     */
    static async retryApiCall(apiCall, config, context) {
        let lastError;
        let attempts = 0;
        while (attempts < config.maxAttempts) {
            try {
                attempts++;
                Logger.info(`${context} - Attempt ${attempts}/${config.maxAttempts}`);
                return await apiCall();
            }
            catch (error) {
                lastError = error;
                Logger.warn(`${context} - Attempt ${attempts} failed`, error);
                if (attempts < config.maxAttempts) {
                    const delay = Math.min(config.baseDelay * Math.pow(2, attempts - 1), config.maxDelay || Infinity);
                    await new Promise((resolve) => setTimeout(resolve, delay));
                }
            }
        }
        Logger.error(`${context} - All attempts failed`, lastError);
        throw lastError;
    }
}
//# sourceMappingURL=retry-helper.js.map