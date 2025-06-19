import { User, UserApiResponse, validateApiResponse } from "./user.schemas.js";
import { APP_CONSTANTS } from "../config/constants.js";
import { CacheManager } from "../utils/cache-manager.js";
import { APIHelper } from "../utils/api-helper.js";
import { RetryHelper } from "../utils/retry-helper.js";
import { Logger } from "../utils/logger.js";
import { ZodError } from "zod";

/**
 * Service for handling user-related API operations with Zod validation
 */
export class UserService {
  static async fetchFreshUsers(
    count: number = APP_CONSTANTS.DEFAULT_USER_COUNT
  ): Promise<User[]> {
    // Clear existing cache to ensure fresh data
    CacheManager.removeItem(CacheManager.CACHE_KEYS.USERS);

    return await RetryHelper.retryApiCall(
      async () => {
        const url = `https://randomuser.me/api/?results=${count}&inc=name,location,picture`;

        try {
          // Fetch raw data from API
          const rawData = await APIHelper.fetchData<Record<string, any>>(
            url,
            "Failed to fetch users from API"
          );

          const validatedResponse: UserApiResponse =
            validateApiResponse(rawData);
          const validatedUsers = validatedResponse.results;

          // Cache the validated users
          CacheManager.setItem(CacheManager.CACHE_KEYS.USERS, validatedUsers);
          Logger.success(
            `✅ Fetched and validated ${validatedUsers.length} fresh users`
          );

          return validatedUsers;
        } catch (error) {
          if (error instanceof ZodError) {
            Logger.error("❌ User data validation failed:", error.message);
            throw new Error(`Invalid user data from API: ${error.message}`);
          }
          const errorMessage =
            error instanceof Error ? error.message : String(error);
          Logger.error("❌ Error fetching users:", errorMessage);
          throw error;
        }
      },
      {
        maxAttempts: APP_CONSTANTS.DEFAULT_RETRY_ATTEMPTS,
        baseDelay: APP_CONSTANTS.DEFAULT_RETRY_DELAY,
        maxDelay: 5000,
      },
      "User API with validation"
    );
  }

  /**
   * Get cached users with validation to ensure data integrity
   * @returns User[] | null - Array of validated cached users or null if none exist
   */
  static getCachedUsers(): User[] | null {
    try {
      const rawCached = CacheManager.getItem<User[]>(
        CacheManager.CACHE_KEYS.USERS
      );

      if (!rawCached || !Array.isArray(rawCached)) {
        return null;
      }

      // Basic validation - check if it looks like user data
      if (rawCached.length > 0 && rawCached[0].name && rawCached[0].location) {
        Logger.info(`📦 Found ${rawCached.length} cached users`);
        return rawCached;
      }

      // If validation fails, clear cache
      CacheManager.removeItem(CacheManager.CACHE_KEYS.USERS);
      return null;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      Logger.error("❌ Error retrieving cached users:", errorMessage);
      CacheManager.removeItem(CacheManager.CACHE_KEYS.USERS);
      return null;
    }
  }

  /**
   * Get users with automatic fallback from cache to API
   * @param count - Number of users to fetch if cache is empty
   * @returns Promise<User[]> - Array of validated user objects
   */
  static async getUsers(
    count: number = APP_CONSTANTS.DEFAULT_USER_COUNT
  ): Promise<User[]> {
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
}
