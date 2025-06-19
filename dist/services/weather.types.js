// Utility functions for weather operations
export class WeatherUtils {
    // Check if weather data is still fresh
    static isDataFresh(weather, maxAgeMs) {
        if (!weather || !weather.timestamp) {
            return false;
        }
        const ageMs = Date.now() - weather.timestamp;
        return ageMs < maxAgeMs;
    }
    // Format temperature for display
    static formatTemperature(weather) {
        return `${weather.temperature}°C`;
    }
}
//# sourceMappingURL=weather.types.js.map