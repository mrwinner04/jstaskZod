// API Configuration
export const API_CONFIG = {
  RANDOM_USER_URL: "https://randomuser.me/api",
  WEATHER_URL: "https://api.open-meteo.com/v1/forecast",
  OPENCAGE_API_KEY: "3803866026c549029cf824e5f3719082",
  CACHE_DURATION: 30 * 60 * 1000, // 30 minutes in milliseconds
} as const;

// Application constants
export const APP_CONSTANTS = {
  DEFAULT_USER_COUNT: 5,
  DEFAULT_RETRY_ATTEMPTS: 3,
  DEFAULT_RETRY_DELAY: 1000,
  AUTO_REFRESH_INTERVAL: 30, // minutes
} as const;

// Weather condition codes mapping
export const WEATHER_CODES: Record<number, string> = {
  0: "Clear sky",
  1: "Mainly clear",
  2: "Partly cloudy",
  3: "Overcast",
  45: "Foggy",
  48: "Depositing rime fog",
  51: "Light drizzle",
  53: "Moderate drizzle",
  55: "Dense drizzle",
  61: "Slight rain",
  63: "Moderate rain",
  65: "Heavy rain",
  71: "Slight snow",
  73: "Moderate snow",
  75: "Heavy snow",
  77: "Snow grains",
  80: "Slight rain showers",
  81: "Moderate rain showers",
  82: "Violent rain showers",
  85: "Slight snow showers",
  86: "Heavy snow showers",
  95: "Thunderstorm",
  96: "Thunderstorm with slight hail",
  99: "Thunderstorm with heavy hail",
};
