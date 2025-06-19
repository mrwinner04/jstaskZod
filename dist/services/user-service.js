import { APP_CONSTANTS } from "../config/constants.js";
import { CacheManager } from "../utils/cache-manager.js";
import { APIHelper } from "../utils/api-helper.js";
import { RetryHelper } from "../utils/retry-helper.js";
import { Logger } from "../utils/logger.js";
/**
 * Service for handling user-related API operations
 */
export class UserService {
    static async fetchFreshUsers(count = APP_CONSTANTS.DEFAULT_USER_COUNT) {
        CacheManager.removeItem(CacheManager.CACHE_KEYS.USERS);
        return await RetryHelper.retryApiCall(async () => {
            const url = `https://randomuser.me/api/?results=${count}&inc=name,location,picture`;
            const data = await APIHelper.fetchData(url, "Failed to fetch users");
            APIHelper.validateData(data, (d) => Array.isArray(d.results) && d.results.length > 0, "No users found in response");
            // Cache the fresh users
            CacheManager.setItem(CacheManager.CACHE_KEYS.USERS, data.results);
            Logger.success(`✅ Fetched ${data.results.length} fresh users`);
            return data.results;
        }, {
            maxAttempts: APP_CONSTANTS.DEFAULT_RETRY_ATTEMPTS,
            baseDelay: APP_CONSTANTS.DEFAULT_RETRY_DELAY,
            maxDelay: 5000,
        }, "User API");
    }
    /**
     * Get cached users if available
     */
    static getCachedUsers() {
        const cached = CacheManager.getItem(CacheManager.CACHE_KEYS.USERS);
        if (cached && Array.isArray(cached) && cached.length > 0) {
            Logger.info(`📦 Found ${cached.length} cached users`);
            return cached;
        }
        return null;
    }
}
//# sourceMappingURL=user-service.js.map