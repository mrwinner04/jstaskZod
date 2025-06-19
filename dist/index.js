import { UIManager } from "./ui/ui-manager.js";
import { Logger } from "./utils/logger.js";
/**
 * Main application class - entry point
 */
class WeatherApp {
    constructor() {
        this.uiManager = new UIManager();
        this.initialize();
    }
    initialize() {
        Logger.info("🚀 Weather App initialized");
    }
}
// Initialize the application when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
    new WeatherApp();
});
//# sourceMappingURL=index.js.map