import { UserWeatherData } from "./ui.types.js";
import { WeatherData } from "../services/weather.types.js";
import {
  User,
  validateUser,
  getFullName,
  getLocationDisplay,
  getLocationQuery,
} from "../services/user.schemas.js";
import { GeocodingService } from "../services/geocoding-service.js";
import { Logger } from "../utils/logger.js";
import { ZodError } from "zod";

/**
 * Renderer for user cards with Zod validation
 */
export class UserCardRenderer {
  /**
   * Create a user card element with weather information and validated data
   */
  static async createUserCard(
    userWeatherData: UserWeatherData
  ): Promise<HTMLElement> {
    const card = document.createElement("div");
    card.className = "user-card";

    try {
      // Validate user data before rendering
      const validatedUser = validateUser(userWeatherData.user);

      // Get coordinates using the geocoding service
      const locationQuery = getLocationQuery(validatedUser);
      const geocodingResult = await GeocodingService.getCoordinates(
        locationQuery
      );

      // Store coordinates as data attributes
      card.dataset.lat = geocodingResult.lat.toString();
      card.dataset.lng = geocodingResult.lng.toString();
    } catch (error) {
      if (error instanceof ZodError) {
        Logger.error(
          `❌ User validation failed for card creation:`,
          error.message
        );
      } else {
        Logger.error(
          `❌ Failed to get coordinates for user card:`,
          error as Error
        );
      }

      // Set fallback coordinates
      card.dataset.lat = "0";
      card.dataset.lng = "0";
    }

    // Render the card content
    card.innerHTML = this.renderCardContent(userWeatherData);
    return card;
  }

  /**
   * Render the HTML content for a user card
   */
  private static renderCardContent(userWeatherData: UserWeatherData): string {
    try {
      // Validate user data before accessing properties
      const validatedUser = validateUser(userWeatherData.user);

      return `
        <div class="user-card__header">
          <img 
            src="${validatedUser.picture.large}" 
            alt="Avatar for ${getFullName(validatedUser)}" 
            class="user-card__avatar"
          >
          <h2 class="user-card__name">${getFullName(validatedUser)}</h2>
          <div class="user-card__location">${getLocationDisplay(
            validatedUser
          )}</div>
        </div>
        <div class="user-card__weather">
          ${this.renderWeatherInfo(userWeatherData.weather)}
        </div>
      `;
    } catch (error) {
      if (error instanceof ZodError) {
        Logger.error(
          `❌ User validation failed during card content rendering:`,
          error.message
        );
      }

      return `
        <div class="user-card__header user-card__error">
          <div class="user-card__error-icon">⚠️</div>
          <h2 class="user-card__name">Error</h2>
          <div class="user-card__location">Invalid user data</div>
        </div>
        <div class="user-card__weather">
          <div class="weather-info weather-error">
            <div class="weather-message">Unable to load user data</div>
          </div>
        </div>
      `;
    }
  }

  /**
   * Update weather information in an existing card
   */
  static updateWeatherInfo(
    card: HTMLElement,
    weather: WeatherData | null
  ): void {
    const weatherContainer = card.querySelector(".user-card__weather");
    if (weatherContainer) {
      weatherContainer.innerHTML = this.renderWeatherInfo(weather);
    }
  }

  /**
   * Render weather information HTML
   */
  private static renderWeatherInfo(weather: WeatherData | null): string {
    if (!weather) {
      return `
        <div class="weather-info weather-error">
          <div class="weather-message">Weather data unavailable</div>
        </div>
      `;
    }

    const staleClass = weather.stale ? "weather-stale" : "";

    return `
      <div class="weather-info ${staleClass}">
        <div class="weather-temperature">${weather.temperature}°C</div>
        <div class="weather-condition">${weather.condition}</div>
        <div class="weather-humidity">Humidity: ${weather.humidity}%</div>
        ${
          weather.stale
            ? '<div class="weather-warning">⚠️ Using cached data</div>'
            : ""
        }
      </div>
    `;
  }
}
