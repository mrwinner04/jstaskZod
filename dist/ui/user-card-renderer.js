import { UserUtils } from "../services/user.types.js";
import { GeocodingService } from "../services/geocoding-service.js";
/**
 * Handles rendering of user cards in the UI
 */
export class UserCardRenderer {
    /**
     * Create a user card element with weather information
     */
    static async createUserCard(userWeatherData) {
        const card = document.createElement("div");
        card.className = "user-card";
        try {
            // Get coordinates using the dedicated geocoding service
            const locationQuery = UserUtils.getLocationQuery(userWeatherData.user);
            const geocodingResult = await GeocodingService.getCoordinates(locationQuery);
            card.dataset.lat = geocodingResult.lat.toString();
            card.dataset.lng = geocodingResult.lng.toString();
        }
        catch (error) {
            console.error("Failed to get coordinates for user card:", error);
            // Set fallback coordinates (will cause weather refresh to fail gracefully)
            card.dataset.lat = "0";
            card.dataset.lng = "0";
        }
        card.innerHTML = `
      <div class="user-card__header">
        <img 
          src="${userWeatherData.user.picture.large}" 
          alt="User avatar" 
          class="user-card__avatar"
        >
        <h2 class="user-card__name">${UserUtils.getFullName(userWeatherData.user)}</h2>
        <div class="user-card__location">${UserUtils.getLocationDisplay(userWeatherData.user)}</div>
      </div>
      <div class="user-card__weather">
        ${this.renderWeatherInfo(userWeatherData.weather)}
      </div>
    `;
        return card;
    }
    /**
     * Update weather information in an existing card
     */
    static updateWeatherInfo(card, weather) {
        const weatherContainer = card.querySelector(".user-card__weather");
        if (weatherContainer) {
            weatherContainer.innerHTML = this.renderWeatherInfo(weather);
        }
    }
    /**
     * Render weather information HTML
     */
    static renderWeatherInfo(weather) {
        if (!weather) {
            return `
        <div class="weather-info weather-error">
          <div class="weather-message">Weather data unavailable</div>
        </div>
      `;
        }
        const staleClass = weather.stale ? "weather-stale" : "";
        const staleWarning = weather.stale ? " ⚠️ Stale data" : "";
        return `
      <div class="weather-info ${staleClass}">
        <div class="weather-temperature">${weather.temperature}°C</div>
        <div class="weather-condition">${weather.condition}</div>
        <div class="weather-humidity">Humidity: ${weather.humidity}%</div>
        ${weather.stale
            ? '<div class="weather-warning">Using cached data</div>'
            : ""}
      </div>
    `;
    }
}
//# sourceMappingURL=user-card-renderer.js.map