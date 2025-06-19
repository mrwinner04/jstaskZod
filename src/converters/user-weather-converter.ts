import {
  User,
  validateUser,
  getLocationQuery,
} from "../services/user.schemas.js";
import { WeatherService } from "../services/weather-service.js";
import { GeocodingService } from "../services/geocoding-service.js";
import { UserWeatherData } from "../ui/ui.types.js";
import { Logger } from "../utils/logger.js";
import { ZodError } from "zod";

export class UserWeatherConverter {
  static async convertUserToUserWeatherData(
    user: User
  ): Promise<UserWeatherData> {
    try {
      const validatedUser = validateUser(user);
      const locationQuery = getLocationQuery(validatedUser);
      const geocodingResult = await GeocodingService.getCoordinates(
        locationQuery
      );
      const weather = await WeatherService.getCurrentWeather(
        geocodingResult.lat,
        geocodingResult.lng
      );

      return {
        user: validatedUser,
        weather,
      };
    } catch (error) {
      if (error instanceof ZodError) {
        Logger.error(
          `❌ User validation failed during conversion:`,
          error.message
        );
      } else {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        Logger.error(
          `❌ Error converting user to user-weather data:`,
          errorMessage
        );
      }

      return {
        user,
        weather: null,
      };
    }
  }
}
