import { UserValidator, UserUtils, } from "../services/user.schemas.js";
import { UserService } from "../services/user-service.js";
import { UserWeatherConverter } from "../converters/user-weather-converter.js";
import { Logger } from "../utils/logger.js";
/**
 * Example usage of the Zod-validated user system
 * This file demonstrates best practices for working with validated user data
 */
export class UserValidationExample {
    /**
     * Example 1: Basic user validation
     * Shows how to validate raw user data from any source
     */
    static basicUserValidation() {
        Logger.info("📘 Example 1: Basic User Validation");
        // Example of valid user data
        const validUserData = {
            name: {
                first: "John",
                last: "Doe",
            },
            location: {
                city: "New York",
                country: "United States",
            },
            picture: {
                large: "https://randomuser.me/api/portraits/men/1.jpg",
            },
        };
        try {
            // Validate the user data
            const validatedUser = UserValidator.validateUser(validUserData);
            Logger.success(`✅ Valid user: ${UserUtils.getFullName(validatedUser)}`);
            Logger.info(`📍 Location: ${UserUtils.getLocationDisplay(validatedUser)}`);
        }
        catch (error) {
            Logger.error("❌ Validation failed:", error);
        }
    }
    /**
     * Example 2: Safe validation with error handling
     * Shows how to handle validation errors gracefully
     */
    static safeUserValidation() {
        Logger.info("📘 Example 2: Safe User Validation");
        // Example of invalid user data (missing required fields)
        const invalidUserData = {
            name: {
                first: "", // Empty name (should fail validation)
                last: "Doe",
            },
            location: {
                city: "New York",
                // Missing country (should fail validation)
            },
            picture: {
                large: "not-a-valid-url", // Invalid URL (should fail validation)
            },
        };
        const result = UserValidator.safeValidateUser(invalidUserData);
        if (result.success) {
            Logger.success(`✅ Valid user: ${UserUtils.getFullName(result.data)}`);
        }
        else {
            Logger.error(`❌ Validation failed: ${result.error}`);
            Logger.info("💡 This demonstrates graceful error handling");
        }
    }
    /**
     * Example 3: API response validation
     * Shows how to validate entire API responses from randomuser.me
     */
    static apiResponseValidation() {
        Logger.info("📘 Example 3: API Response Validation");
        // Mock API response structure
        const mockApiResponse = {
            results: [
                {
                    name: { first: "Alice", last: "Johnson" },
                    location: { city: "London", country: "United Kingdom" },
                    picture: { large: "https://randomuser.me/api/portraits/women/1.jpg" },
                },
                {
                    name: { first: "Bob", last: "Smith" },
                    location: { city: "Toronto", country: "Canada" },
                    picture: { large: "https://randomuser.me/api/portraits/men/2.jpg" },
                },
            ],
            info: {
                seed: "example123",
                results: 2,
                page: 1,
                version: "1.3",
            },
        };
        try {
            // Validate the entire API response
            const validatedResponse = UserValidator.validateApiResponse(mockApiResponse);
            Logger.success(`✅ Valid API response with ${validatedResponse.results.length} users`);
            // Work with validated users
            validatedResponse.results.forEach((user, index) => {
                Logger.info(`👤 User ${index + 1}: ${UserUtils.getFullName(user)} from ${UserUtils.getLocationDisplay(user)}`);
            });
        }
        catch (error) {
            Logger.error("❌ API response validation failed:", error);
        }
    }
    /**
     * Example 4: Using the enhanced UserService
     * Shows how to fetch and validate users with the new service methods
     */
    static async enhancedUserService() {
        Logger.info("📘 Example 4: Enhanced User Service");
        try {
            // Get users with automatic cache/API fallback
            const users = await UserService.getUsers(3);
            Logger.success(`✅ Retrieved ${users.length} validated users`);
            // All users are automatically validated by the service
            users.forEach((user, index) => {
                Logger.info(`👤 User ${index + 1}: ${UserUtils.getFullName(user)}`);
                Logger.info(`📍 Location: ${UserUtils.getLocationDisplay(user)}`);
                Logger.info(`🔗 Query: ${UserUtils.getLocationQuery(user)}`);
            });
        }
        catch (error) {
            Logger.error("❌ Enhanced service example failed:", error);
        }
    }
    /**
     * Example 5: User-Weather conversion with validation
     * Shows how to safely convert users to user-weather data
     */
    static async userWeatherConversion() {
        Logger.info("📘 Example 5: User-Weather Conversion");
        try {
            // Get a validated user
            const users = await UserService.getUsers(1);
            if (users.length === 0) {
                Logger.warn("⚠️  No users available for conversion example");
                return;
            }
            const user = users[0];
            Logger.info(`🔄 Converting user: ${UserUtils.getFullName(user)}`);
            // Convert to user-weather data with validation
            const userWeatherData = await UserWeatherConverter.convertUserToUserWeatherData(user);
            Logger.success(`✅ Conversion successful for: ${UserUtils.getFullName(userWeatherData.user)}`);
            if (userWeatherData.weather) {
                Logger.info(`🌤️  Weather: ${userWeatherData.weather.temperature}°C, ${userWeatherData.weather.condition}`);
            }
            else {
                Logger.warn("⚠️  Weather data unavailable");
            }
        }
        catch (error) {
            Logger.error("❌ User-weather conversion example failed:", error);
        }
    }
    /**
     * Example 6: Data sanitization and validation
     * Shows how to sanitize and validate user input safely
     */
    static dataSanitization() {
        Logger.info("📘 Example 6: Data Sanitization");
        // Example of user data that needs sanitization
        const unsanitizedData = {
            name: {
                first: "  John  ", // Extra whitespace
                last: " Doe ",
            },
            location: {
                city: "New York  ",
                country: "  United States",
            },
            picture: {
                large: "https://randomuser.me/api/portraits/men/1.jpg",
            },
        };
        try {
            // The Zod schema automatically trims whitespace
            const sanitizedUser = UserValidator.validateUser(unsanitizedData);
            Logger.success(`✅ Sanitized user: "${UserUtils.getFullName(sanitizedUser)}"`);
            Logger.info(`📍 Clean location: "${UserUtils.getLocationDisplay(sanitizedUser)}"`);
        }
        catch (error) {
            Logger.error("❌ Sanitization failed:", error);
        }
    }
    /**
     * Run all examples
     * Demonstrates the complete Zod validation system
     */
    static async runAllExamples() {
        Logger.info("🚀 Starting Zod User Validation Examples");
        Logger.info("=".repeat(50));
        // Run synchronous examples
        this.basicUserValidation();
        console.log(); // Empty line for readability
        this.safeUserValidation();
        console.log();
        this.apiResponseValidation();
        console.log();
        this.dataSanitization();
        console.log();
        // Run asynchronous examples
        await this.enhancedUserService();
        console.log();
        await this.userWeatherConversion();
        Logger.info("=".repeat(50));
        Logger.success("🎉 All examples completed!");
    }
}
// Export a simple function to run examples from console or other files
export const runUserValidationExamples = () => UserValidationExample.runAllExamples();
//# sourceMappingURL=user-validation-example.js.map