import { WeatherData, WeatherUtils } from "./weather.types.js";
import {
  API_CONFIG,
  WEATHER_CODES,
  APP_CONSTANTS,
} from "../config/constants.js";
import { APIHelper } from "../utils/api-helper.js";
import { RetryHelper } from "../utils/retry-helper.js";
import { Logger } from "../utils/logger.js";

/**
 * Service for handling weather-related API operations
 */
export class WeatherService {
  static async getCurrentWeather(
    lat: number,
    lng: number
  ): Promise<WeatherData> {
    if (!lat || !lng) {
      Logger.error("Invalid coordinates:", { lat, lng });
      throw new Error("Invalid coordinates");
    }

    return await RetryHelper.retryApiCall(
      async () => {
        const url = `${API_CONFIG.WEATHER_URL}?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,weather_code`;
        const data = await APIHelper.fetchData<{
          current: {
            temperature_2m: number;
            relative_humidity_2m: number;
            weather_code: number;
          };
        }>(url, "Failed to get weather data");

        APIHelper.validateData(
          data,
          (d) => Boolean(d.current),
          "No current weather data available"
        );

        return {
          temperature: data.current.temperature_2m,
          humidity: data.current.relative_humidity_2m,
          condition: WEATHER_CODES[data.current.weather_code] || "Unknown",
          timestamp: Date.now(),
        };
      },
      {
        maxAttempts: APP_CONSTANTS.DEFAULT_RETRY_ATTEMPTS,
        baseDelay: APP_CONSTANTS.DEFAULT_RETRY_DELAY,
        maxDelay: 5000,
      },
      `Weather API (${lat}, ${lng})`
    );
  }

  /**
   * Check if weather data is still fresh (less than cache duration)
   */
  static isWeatherDataFresh(weatherData: WeatherData | null): boolean {
    return WeatherUtils.isDataFresh(weatherData!, API_CONFIG.CACHE_DURATION);
  }

  /**
   * Get weather with fallback to cached data if API fails
   */
  static async getWeatherWithFallback(
    lat: number,
    lng: number,
    fallbackData: WeatherData | null = null
  ): Promise<WeatherData> {
    try {
      return await this.getCurrentWeather(lat, lng);
    } catch (error) {
      Logger.warn(
        `Weather API failed, using fallback data for ${lat}, ${lng}`,
        error
      );

      if (fallbackData && this.isWeatherDataFresh(fallbackData)) {
        Logger.info("Using fresh cached weather data");
        return fallbackData;
      } else if (fallbackData) {
        Logger.warn(
          "Cached weather data is stale but will be used as fallback"
        );
        return { ...fallbackData, stale: true };
      } else {
        Logger.error("No fallback weather data available", error);
        throw error;
      }
    }
  }
}
