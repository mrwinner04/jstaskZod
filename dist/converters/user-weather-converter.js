import { UserUtils, UserValidator } from "../services/user.schemas.js";
import { WeatherService } from "../services/weather-service.js";
import { GeocodingService } from "../services/geocoding-service.js";
import { Logger } from "../utils/logger.js";
import { ZodError } from "zod";
/**
 * Enhanced converter for combining user and weather data with robust validation
 * Uses Zod-validated user data to ensure data integrity throughout the conversion process
 */
export class UserWeatherConverter {
    /**
     * Convert a validated user to user-weather data by fetching weather for their location
     * @param user - Zod-validated user object
     * @returns Promise<UserWeatherData> - Combined user and weather data
     */
    static async convertUserToUserWeatherData(user) {
        try {
            // Validate the input user data to ensure integrity
            const validatedUser = UserValidator.validateUser(user);
            Logger.info(`🔄 Converting user data for: ${UserUtils.getFullName(validatedUser)}`);
            // Get coordinates using the geocoding service
            const locationQuery = UserUtils.getLocationQuery(validatedUser);
            Logger.info(`📍 Getting coordinates for: ${locationQuery}`);
            const geocodingResult = await GeocodingService.getCoordinates(locationQuery);
            // Fetch weather data for the user's location
            Logger.info(`🌤️  Fetching weather for coordinates: ${geocodingResult.lat}, ${geocodingResult.lng}`);
            const weather = await WeatherService.getCurrentWeather(geocodingResult.lat, geocodingResult.lng);
            Logger.success(`✅ Successfully converted user data for: ${UserUtils.getFullName(validatedUser)}`);
            return {
                user: validatedUser,
                weather,
            };
        }
        catch (error) {
            // Enhanced error handling with specific error types
            if (error instanceof ZodError) {
                Logger.error(`❌ User validation failed during conversion:`, {
                    user: user,
                    validationErrors: error.issues,
                    messages: error.issues.map((issue) => issue.message),
                });
                // Return user data with null weather to allow partial functionality
                return {
                    user,
                    weather: null,
                };
            }
            Logger.error(`❌ Error converting user to user-weather data for: ${UserUtils.getFullName(user)}`, {
                error: error instanceof Error ? error.message : "Unknown error",
                user: user,
                stack: error instanceof Error ? error.stack : undefined,
            });
            // Return user data with null weather to maintain app functionality
            return {
                user,
                weather: null,
            };
        }
    }
    /**
     * Convert multiple users to user-weather data in parallel
     * @param users - Array of Zod-validated user objects
     * @returns Promise<UserWeatherData[]> - Array of combined user and weather data
     */
    static async convertUsersToUserWeatherData(users) {
        try {
            // Validate the entire users array first
            const validatedUsers = UserValidator.validateUsers(users);
            Logger.info(`🔄 Converting ${validatedUsers.length} users to user-weather data`);
            // Convert all users in parallel for better performance
            const conversionPromises = validatedUsers.map((user) => this.convertUserToUserWeatherData(user));
            const results = await Promise.all(conversionPromises);
            // Log summary of successful conversions
            const successfulConversions = results.filter((result) => result.weather !== null);
            const failedConversions = results.filter((result) => result.weather === null);
            Logger.info(`📊 Conversion summary: ${successfulConversions.length} successful, ${failedConversions.length} failed`);
            return results;
        }
        catch (error) {
            if (error instanceof ZodError) {
                Logger.error(`❌ Users array validation failed:`, {
                    validationErrors: error.issues,
                    messages: error.issues.map((issue) => issue.message),
                });
                throw new Error(`Invalid users array: ${error.message}`);
            }
            Logger.error(`❌ Error converting users array to user-weather data:`, error);
            throw error;
        }
    }
    /**
     * Safely convert a user with comprehensive error handling
     * @param userData - Raw user data to validate and convert
     * @returns Promise with success/error result
     */
    static async safeConvertUserToUserWeatherData(userData) {
        try {
            // First validate the user data
            const validationResult = UserValidator.safeValidateUser(userData);
            if (!validationResult.success) {
                return {
                    success: false,
                    data: null,
                    error: `User validation failed: ${validationResult.error}`,
                };
            }
            // Convert the validated user
            const userWeatherData = await this.convertUserToUserWeatherData(validationResult.data);
            return {
                success: true,
                data: userWeatherData,
                error: null,
            };
        }
        catch (error) {
            return {
                success: false,
                data: null,
                error: error instanceof Error ? error.message : "Unknown conversion error",
            };
        }
    }
    /**
     * Re-validate existing UserWeatherData to ensure data integrity
     * @param userWeatherData - Existing user-weather data to validate
     * @returns Validated UserWeatherData or throws error
     */
    static validateUserWeatherData(userWeatherData) {
        try {
            // Validate the user portion of the data
            const validatedUser = UserValidator.validateUser(userWeatherData.user);
            return {
                user: validatedUser,
                weather: userWeatherData.weather, // Weather validation handled by WeatherService
            };
        }
        catch (error) {
            if (error instanceof ZodError) {
                Logger.error(`❌ UserWeatherData validation failed:`, error.issues);
                throw new Error(`Invalid UserWeatherData: ${error.message}`);
            }
            throw error;
        }
    }
}
//# sourceMappingURL=user-weather-converter.js.map