import { User } from "../services/user.schemas.js";
import { WeatherData } from "../services/weather.types.js";

export interface UserWeatherData {
  user: User;
  weather: WeatherData | null;
}
