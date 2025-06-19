/**
 * Logger utility class for consistent logging throughout the application
 */
export class Logger {
  private static readonly LOG_PREFIX = "🌤️ Weather App:";

  static info(message: string, context?: object | string | number): void {
    console.log(`${this.LOG_PREFIX} ℹ️ ${message}`, context ? context : "");
  }

  static success(message: string, context?: object | string | number): void {
    console.log(`${this.LOG_PREFIX} ✅ ${message}`, context ? context : "");
  }

  static warn(message: string, context?: object | string | number): void {
    console.warn(`${this.LOG_PREFIX} ⚠️ ${message}`, context ? context : "");
  }

  static error(message: string, error?: Error | string | object): void {
    console.error(`${this.LOG_PREFIX} ❌ ${message}`, error ? error : "");
  }

  static weatherRefresh(lat: number, lng: number): void {
    console.log(
      `${this.LOG_PREFIX} [WEATHER] Refreshing weather for coordinates: ${lat}, ${lng}`
    );
  }

  static summary(successCount: number, totalCount: number): void {
    const successRate = ((successCount / totalCount) * 100).toFixed(1);
    this.info(
      `Weather refresh summary: ${successCount}/${totalCount} successful (${successRate}%)`
    );
  }
}
