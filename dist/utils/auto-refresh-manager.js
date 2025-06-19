import { Logger } from "./logger.js";
/**
 * Manager for handling automatic refresh of weather data
 */
export class AutoRefreshManager {
    constructor(refreshCallback, intervalMinutes) {
        this.refreshCallback = refreshCallback;
        this.intervalMinutes = intervalMinutes;
        this.intervalId = null;
    }
    /**
     * Start the auto-refresh timer
     */
    start() {
        if (this.intervalId !== null) {
            Logger.warn("Auto-refresh already running");
            return;
        }
        const intervalMs = this.intervalMinutes * 60 * 1000;
        this.intervalId = window.setInterval(() => {
            Logger.info(`⏰ Auto-refresh triggered (every ${this.intervalMinutes} minutes)`);
            this.refreshCallback();
        }, intervalMs);
        Logger.info(`🔄 Auto-refresh started (every ${this.intervalMinutes} minutes)`);
    }
    /**
     * Stop the auto-refresh timer
     */
    stop() {
        if (this.intervalId === null) {
            return;
        }
        window.clearInterval(this.intervalId);
        this.intervalId = null;
        Logger.info("⏹️ Auto-refresh stopped");
    }
    /**
     * Check if auto-refresh is currently running
     */
    isRunning() {
        return this.intervalId !== null;
    }
}
//# sourceMappingURL=auto-refresh-manager.js.map