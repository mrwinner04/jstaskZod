import { Logger } from "./logger.js";
/**
 * Helper class for API operations
 */
export class APIHelper {
    /**
     * Fetch data from API with error handling
     */
    static async fetchData(url, errorMessage) {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            return data;
        }
        catch (error) {
            Logger.error(errorMessage, error);
            throw error;
        }
    }
    /**
     * Validate API response data
     */
    static validateData(data, validator, errorMessage) {
        if (!validator(data)) {
            throw new Error(errorMessage);
        }
    }
    /**
     * Handle API errors with retry logic
     */
    static async handleApiError(error, retryCount) {
        if (retryCount > 0) {
            const delay = Math.min(1000 * Math.pow(2, 3 - retryCount), 5000);
            Logger.warn(`Retrying in ${delay}ms... (${retryCount} attempts remaining)`, error);
            await new Promise((resolve) => setTimeout(resolve, delay));
        }
        else {
            throw error;
        }
    }
}
//# sourceMappingURL=api-helper.js.map