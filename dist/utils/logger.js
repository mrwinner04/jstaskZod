/**
 * Logger utility class for consistent logging throughout the application
 */
export class Logger {
    static info(message, context) {
        console.log(`${this.LOG_PREFIX} ℹ️ ${message}`, context || "");
    }
    static success(message, context) {
        console.log(`${this.LOG_PREFIX} ✅ ${message}`, context || "");
    }
    static warn(message, context) {
        console.warn(`${this.LOG_PREFIX} ⚠️ ${message}`, context || "");
    }
    static error(message, error) {
        console.error(`${this.LOG_PREFIX} ❌ ${message}`, error || "");
    }
    static weatherRefresh(lat, lng) {
        this.info(`Fetching weather for coordinates: ${lat}, ${lng}`);
    }
    static summary(successCount, totalCount) {
        const successRate = ((successCount / totalCount) * 100).toFixed(1);
        this.info(`Weather refresh summary: ${successCount}/${totalCount} successful (${successRate}%)`);
    }
}
Logger.LOG_PREFIX = "🌤️ Weather App:";
//# sourceMappingURL=logger.js.map