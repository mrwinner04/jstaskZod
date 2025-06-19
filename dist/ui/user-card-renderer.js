import { UserUtils, UserValidator } from "../services/user.schemas.js";
import { GeocodingService } from "../services/geocoding-service.js";
import { Logger } from "../utils/logger.js";
import { ZodError } from "zod";
/**
 * Enhanced renderer for user cards with Zod validation and robust error handling
 * Ensures all user data is validated before rendering to prevent UI corruption
 */
export class UserCardRenderer {
    /**
     * Create a user card element with weather information and validated data
     * @param userWeatherData - Combined user and weather data to render
     * @returns Promise<HTMLElement> - Rendered user card element
     */
    static async createUserCard(userWeatherData) {
        const card = document.createElement("div");
        card.className = "user-card";
        try {
            // Validate user data before rendering to ensure data integrity
            const validatedUser = UserValidator.validateUser(userWeatherData.user);
            Logger.info(`🎨 Creating user card for: ${UserUtils.getFullName(validatedUser)}`);
            // Get coordinates using the dedicated geocoding service
            const locationQuery = UserUtils.getLocationQuery(validatedUser);
            Logger.info(`📍 Getting coordinates for card: ${locationQuery}`);
            const geocodingResult = await GeocodingService.getCoordinates(locationQuery);
            // Store coordinates as data attributes for future weather updates
            card.dataset.lat = geocodingResult.lat.toString();
            card.dataset.lng = geocodingResult.lng.toString();
            // Store user identifier for debugging and updates
            card.dataset.userName = UserUtils.getFullName(validatedUser);
            Logger.success(`✅ Successfully set coordinates for ${UserUtils.getFullName(validatedUser)}: ${geocodingResult.lat}, ${geocodingResult.lng}`);
        }
        catch (error) {
            // Enhanced error handling for validation and geocoding failures
            if (error instanceof ZodError) {
                Logger.error(`❌ User validation failed for card creation:`, {
                    validationErrors: error.issues,
                    messages: error.issues.map((issue) => issue.message),
                    userData: userWeatherData.user,
                });
                // Set error state in card for debugging
                card.dataset.validationError = "true";
                card.dataset.errorMessage = "User data validation failed";
            }
            else {
                Logger.error(`❌ Failed to get coordinates for user card:`, {
                    error: error instanceof Error ? error.message : "Unknown error",
                    user: userWeatherData.user,
                    locationQuery: UserUtils.getLocationQuery(userWeatherData.user),
                });
            }
            // Set fallback coordinates (will cause weather refresh to fail gracefully)
            card.dataset.lat = "0";
            card.dataset.lng = "0";
            card.dataset.geocodingError = "true";
        }
        // Render the card content with validated or fallback data
        card.innerHTML = this.renderCardContent(userWeatherData);
        return card;
    }
    /**
     * Render the HTML content for a user card
     * @param userWeatherData - Combined user and weather data
     * @returns string - HTML content for the card
     */
    static renderCardContent(userWeatherData) {
        try {
            // Validate user data before accessing properties
            const validatedUser = UserValidator.validateUser(userWeatherData.user);
            return `
        <div class="user-card__header">
          <img 
            src="${this.sanitizeImageUrl(validatedUser.picture.large)}" 
            alt="Avatar for ${this.sanitizeText(UserUtils.getFullName(validatedUser))}" 
            class="user-card__avatar"
            onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iNTAiIGN5PSI1MCIgcj0iNTAiIGZpbGw9IiNFNUU3RUIiLz48dGV4dCB4PSI1MCIgeT0iNTUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzZCNzI4MCIgdGV4dC1hbmNob3I9Im1pZGRsZSI+Tm8gSW1hZ2U8L3RleHQ+PC9zdmc+'"
          >
          <h2 class="user-card__name">${this.sanitizeText(UserUtils.getFullName(validatedUser))}</h2>
          <div class="user-card__location">${this.sanitizeText(UserUtils.getLocationDisplay(validatedUser))}</div>
        </div>
        <div class="user-card__weather">
          ${this.renderWeatherInfo(userWeatherData.weather)}
        </div>
      `;
        }
        catch (error) {
            if (error instanceof ZodError) {
                Logger.error(`❌ User validation failed during card content rendering:`, error.issues);
                return this.renderErrorCard("Invalid user data");
            }
            Logger.error(`❌ Error rendering card content:`, error);
            return this.renderErrorCard("Error rendering user card");
        }
    }
    /**
     * Render an error card when user data is invalid
     * @param errorMessage - Error message to display
     * @returns string - HTML content for error card
     */
    static renderErrorCard(errorMessage) {
        return `
      <div class="user-card__header user-card__error">
        <div class="user-card__error-icon">⚠️</div>
        <h2 class="user-card__name">Error</h2>
        <div class="user-card__location">${this.sanitizeText(errorMessage)}</div>
      </div>
      <div class="user-card__weather">
        <div class="weather-info weather-error">
          <div class="weather-message">Unable to load user data</div>
        </div>
      </div>
    `;
    }
    /**
     * Update weather information in an existing card with validation
     * @param card - HTML card element to update
     * @param weather - Weather data to display
     */
    static updateWeatherInfo(card, weather) {
        try {
            const weatherContainer = card.querySelector(".user-card__weather");
            if (weatherContainer) {
                weatherContainer.innerHTML = this.renderWeatherInfo(weather);
                Logger.info(`🌤️  Updated weather info for card: ${card.dataset.userName || "Unknown user"}`);
            }
            else {
                Logger.warn(`⚠️  Weather container not found in card for: ${card.dataset.userName || "Unknown user"}`);
            }
        }
        catch (error) {
            Logger.error(`❌ Error updating weather info:`, {
                error: error instanceof Error ? error.message : "Unknown error",
                userName: card.dataset.userName,
                weather,
            });
        }
    }
    /**
     * Render weather information HTML with enhanced error handling
     * @param weather - Weather data to render (can be null)
     * @returns string - HTML content for weather section
     */
    static renderWeatherInfo(weather) {
        if (!weather) {
            return `
        <div class="weather-info weather-error">
          <div class="weather-message">Weather data unavailable</div>
          <div class="weather-hint">Check your internet connection and try again</div>
        </div>
      `;
        }
        const staleClass = weather.stale ? "weather-stale" : "";
        return `
      <div class="weather-info ${staleClass}">
        <div class="weather-temperature">${this.sanitizeText(weather.temperature.toString())}°C</div>
        <div class="weather-condition">${this.sanitizeText(weather.condition)}</div>
        <div class="weather-humidity">Humidity: ${this.sanitizeText(weather.humidity.toString())}%</div>
        ${weather.stale
            ? '<div class="weather-warning">⚠️ Using cached data - Refresh for latest weather</div>'
            : '<div class="weather-fresh">🌟 Fresh weather data</div>'}
      </div>
    `;
    }
    /**
     * Safely validate and render a user card
     * @param userWeatherData - Raw user-weather data to validate and render
     * @returns Promise with success/error result containing HTML element
     */
    static async safeCreateUserCard(userWeatherData) {
        try {
            // Validate the structure of userWeatherData
            if (!userWeatherData || typeof userWeatherData !== "object") {
                return {
                    success: false,
                    card: null,
                    error: "Invalid user-weather data structure",
                };
            }
            const data = userWeatherData;
            // Validate the user portion of the data
            const userValidation = UserValidator.safeValidateUser(data.user);
            if (!userValidation.success) {
                return {
                    success: false,
                    card: null,
                    error: `User validation failed: ${userValidation.error}`,
                };
            }
            // Create the card with validated data
            const card = await this.createUserCard(data);
            return {
                success: true,
                card,
                error: null,
            };
        }
        catch (error) {
            return {
                success: false,
                card: null,
                error: error instanceof Error
                    ? error.message
                    : "Unknown card creation error",
            };
        }
    }
    /**
     * Sanitize text content to prevent XSS attacks
     * @param text - Text to sanitize
     * @returns Sanitized text safe for HTML
     */
    static sanitizeText(text) {
        const div = document.createElement("div");
        div.textContent = text;
        return div.innerHTML;
    }
    /**
     * Sanitize and validate image URLs
     * @param url - Image URL to sanitize
     * @returns Sanitized URL or fallback
     */
    static sanitizeImageUrl(url) {
        try {
            const urlObj = new URL(url);
            // Only allow https URLs for security
            if (urlObj.protocol !== "https:") {
                Logger.warn(`⚠️  Non-HTTPS image URL detected, using fallback: ${url}`);
                return "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iNTAiIGN5PSI1MCIgcj0iNTAiIGZpbGw9IiNFNUU3RUIiLz48dGV4dCB4PSI1MCIgeT0iNTUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzZCNzI4MCIgdGV4dC1hbmNob3I9Im1pZGRsZSI+Tm8gSW1hZ2U8L3RleHQ+PC9zdmc+";
            }
            return url;
        }
        catch {
            Logger.warn(`⚠️  Invalid image URL detected, using fallback: ${url}`);
            return "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iNTAiIGN5PSI1MCIgcj0iNTAiIGZpbGw9IiNFNUU3RUIiLz48dGV4dCB4PSI1MCIgeT0iNTUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzZCNzI4MCIgdGV4dC1hbmNob3I9Im1pZGRsZSI+Tm8gSW1hZ2U8L3RleHQ+PC9zdmc+";
        }
    }
}
//# sourceMappingURL=user-card-renderer.js.map