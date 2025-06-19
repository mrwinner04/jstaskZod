import { CacheKeys } from "./utils.types.js";
import { API_CONFIG } from "../config/constants.js";
import { Logger } from "./logger.js";

/**
 * Cache manager for handling local storage operations
 */
export class CacheManager {
  static readonly CACHE_KEYS: CacheKeys = {
    USERS: "weather_app_users",
    WEATHER: "weather_app_weather",
    LAST_FETCH: "weather_app_last_fetch",
  };

  /**
   * Get item from cache
   */
  static getItem<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      Logger.error(`Error getting item from cache: ${key}`, error);
      return null;
    }
  }

  /**
   * Set item in cache
   */
  static setItem<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      Logger.error(`Error setting item in cache: ${key}`, error);
    }
  }

  /**
   * Remove item from cache
   */
  static removeItem(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      Logger.error(`Error removing item from cache: ${key}`, error);
    }
  }

  /**
   * Check if weather data should be refreshed
   */
  static shouldRefreshWeather(): boolean {
    const lastFetch = this.getItem<number>(this.CACHE_KEYS.LAST_FETCH);
    if (!lastFetch) return true;

    const now = Date.now();
    const age = now - lastFetch;
    return age >= API_CONFIG.CACHE_DURATION;
  }

  /**
   * Clear all application cache
   */
  static clearAll(): void {
    try {
      Object.values(this.CACHE_KEYS).forEach((key) => {
        localStorage.removeItem(key);
      });
      Logger.info("Cache cleared successfully");
    } catch (error) {
      Logger.error("Error clearing cache", error);
    }
  }
}
