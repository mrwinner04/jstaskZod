export interface WeatherData {
  temperature: number;
  humidity: number;
  condition: string;
  timestamp: number;
  stale?: boolean;
}

// Utility functions for weather operations
export class WeatherUtils {
  // Check if weather data is still fresh
  static isDataFresh(weather: WeatherData, maxAgeMs: number): boolean {
    if (!weather || !weather.timestamp) {
      return false;
    }
    const ageMs = Date.now() - weather.timestamp;
    return ageMs < maxAgeMs;
  }

  // Format temperature for display
  static formatTemperature(weather: WeatherData): string {
    return `${weather.temperature}°C`;
  }
}
