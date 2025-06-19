/**
 * Logger utility class for consistent logging throughout the application
 */
export class Logger {
  private static readonly LOG_PREFIX = "🌤️ Weather App:";

  static info(message: string, context?: unknown): void {
    console.log(`${this.LOG_PREFIX} ℹ️ ${message}`, context || "");
  }

  static success(message: string, context?: unknown): void {
    console.log(`${this.LOG_PREFIX} ✅ ${message}`, context || "");
  }

  static warn(message: string, context?: unknown): void {
    console.warn(`${this.LOG_PREFIX} ⚠️ ${message}`, context || "");
  }

  static error(message: string, error?: unknown): void {
    console.error(`${this.LOG_PREFIX} ❌ ${message}`, error || "");
  }

  static weatherRefresh(lat: number, lng: number): void {
    this.info(`Fetching weather for coordinates: ${lat}, ${lng}`);
  }

  static summary(successCount: number, totalCount: number): void {
    const successRate = ((successCount / totalCount) * 100).toFixed(1);
    this.info(
      `Weather refresh summary: ${successCount}/${totalCount} successful (${successRate}%)`
    );
  }
}
