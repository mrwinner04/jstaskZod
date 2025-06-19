import { UserValidator } from "./user.schemas.js";
import { APP_CONSTANTS } from "../config/constants.js";
import { CacheManager } from "../utils/cache-manager.js";
import { APIHelper } from "../utils/api-helper.js";
import { RetryHelper } from "../utils/retry-helper.js";
import { Logger } from "../utils/logger.js";
import { ZodError } from "zod";
/**
 * Enhanced service for handling user-related API operations with Zod validation
 * Provides robust data validation and error handling for all user operations
 */
export class UserService {
    /**
     * Fetch fresh users from the API with comprehensive validation
     * @param count - Number of users to fetch (default from app constants)
     * @returns Promise<User[]> - Array of validated user objects
     * @throws Error if API fails or data validation fails
     */
    static async fetchFreshUsers(count = APP_CONSTANTS.DEFAULT_USER_COUNT) {
        // Clear existing cache to ensure fresh data
        CacheManager.removeItem(CacheManager.CACHE_KEYS.USERS);
        return await RetryHelper.retryApiCall(async () => {
            const url = `https://randomuser.me/api/?results=${count}&inc=name,location,picture`;
            try {
                // Fetch raw data from API
                const rawData = await APIHelper.fetchData(url, "Failed to fetch users from randomuser.me API");
                Logger.info(`📥 Received raw API response, validating data structure...`);
                // Validate the entire API response structure with Zod
                const validatedResponse = UserValidator.validateApiResponse(rawData);
                // Extract validated users from the response
                const validatedUsers = validatedResponse.results;
                // Additional business logic validation
                if (validatedUsers.length !== count) {
                    Logger.warn(`⚠️  Requested ${count} users but received ${validatedUsers.length}`);
                }
                // Cache the validated users for future use
                CacheManager.setItem(CacheManager.CACHE_KEYS.USERS, validatedUsers);
                Logger.success(`✅ Successfully fetched and validated ${validatedUsers.length} fresh users`);
                return validatedUsers;
            }
            catch (error) {
                // Enhanced error handling for validation failures
                if (error instanceof ZodError) {
                    Logger.error("❌ User data validation failed:", {
                        issues: error.issues,
                        path: error.issues.map((issue) => issue.path.join(".")),
                        messages: error.issues.map((issue) => issue.message),
                    });
                    throw new Error(`Invalid user data from API: ${error.message}`);
                }
                // Re-throw other errors (network, API, etc.)
                throw error;
            }
        }, {
            maxAttempts: APP_CONSTANTS.DEFAULT_RETRY_ATTEMPTS,
            baseDelay: APP_CONSTANTS.DEFAULT_RETRY_DELAY,
            maxDelay: 5000,
        }, "User API with Zod validation");
    }
    /**
     * Get cached users with validation to ensure data integrity
     * @returns User[] | null - Array of validated cached users or null if none exist
     */
    static getCachedUsers() {
        try {
            // Retrieve raw cached data
            const rawCached = CacheManager.getItem(CacheManager.CACHE_KEYS.USERS);
            if (!rawCached) {
                Logger.info("📦 No cached users found");
                return null;
            }
            // Validate cached data with Zod to ensure it hasn't been corrupted
            const validationResult = UserValidator.safeValidateUsers(rawCached);
            if (!validationResult.success) {
                Logger.warn(`⚠️  Cached user data is invalid: ${validationResult.error}`);
                Logger.info("🗑️  Clearing corrupted cache data");
                CacheManager.removeItem(CacheManager.CACHE_KEYS.USERS);
                return null;
            }
            const validatedUsers = validationResult.data;
            Logger.info(`📦 Found and validated ${validatedUsers.length} cached users`);
            return validatedUsers;
        }
        catch (error) {
            Logger.error("❌ Error retrieving cached users:", error);
            // Clean up potentially corrupted cache
            CacheManager.removeItem(CacheManager.CACHE_KEYS.USERS);
            return null;
        }
    }
    /**
     * Get users with automatic fallback from cache to API
     * @param count - Number of users to fetch if cache is empty
     * @returns Promise<User[]> - Array of validated user objects
     */
    static async getUsers(count = APP_CONSTANTS.DEFAULT_USER_COUNT) {
        Logger.info(`🔍 Attempting to get ${count} users...`);
        // Try cache first
        const cachedUsers = this.getCachedUsers();
        if (cachedUsers && cachedUsers.length >= count) {
            Logger.info(`✅ Using ${cachedUsers.length} cached users`);
            return cachedUsers.slice(0, count);
        }
        // Fall back to API if cache is insufficient
        Logger.info(`🌐 Cache insufficient, fetching fresh users from API`);
        return await this.fetchFreshUsers(count);
    }
    /**
     * Validate a single user object
     * @param userData - Raw user data to validate
     * @returns User - Validated user object
     * @throws Error if validation fails
     */
    static validateSingleUser(userData) {
        try {
            return UserValidator.validateUser(userData);
        }
        catch (error) {
            if (error instanceof ZodError) {
                Logger.error("❌ Single user validation failed:", error.issues);
                throw new Error(`Invalid user data: ${error.message}`);
            }
            throw error;
        }
    }
    /**
     * Safely validate a single user with error handling
     * @param userData - Raw user data to validate
     * @returns Validation result with success flag
     */
    static safeValidateSingleUser(userData) {
        const result = UserValidator.safeValidateUser(userData);
        if (result.success) {
            return { success: true, user: result.data, error: null };
        }
        return {
            success: false,
            user: null,
            error: result.error,
        };
    }
}
//# sourceMappingURL=user-service.js.map