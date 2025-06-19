import { User, UserUtils } from "../services/user.types.js";
import { WeatherService } from "../services/weather-service.js";
import { GeocodingService } from "../services/geocoding-service.js";
import { UserWeatherData } from "../ui/ui.types.js";
import { Logger } from "../utils/logger.js";

export class UserWeatherConverter {
  /**
   * Convert a user to user-weather data by fetching weather for their location
   */
  static async convertUserToUserWeatherData(
    user: User
  ): Promise<UserWeatherData> {
    try {
      // Get coordinates using the geocoding service
      const locationQuery = UserUtils.getLocationQuery(user);
      const geocodingResult = await GeocodingService.getCoordinates(
        locationQuery
      );

      const weather = await WeatherService.getCurrentWeather(
        geocodingResult.lat,
        geocodingResult.lng
      );

      return {
        user,
        weather,
      };
    } catch (error) {
      Logger.error("Error converting user to user-weather data:", error);
      return {
        user,
        weather: null,
      };
    }
  }
}
