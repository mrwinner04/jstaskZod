import { User } from "../services/user.types.js";
import { WeatherData } from "../services/weather.types.js";

// Combined user and weather data for UI display
export interface UserWeatherData {
  user: User;
  weather: WeatherData | null;
}
