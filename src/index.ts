import { UIManager } from "./ui/ui-manager.js";
import { Logger } from "./utils/logger.js";

/**
 * Main application class - entry points
 */
class WeatherApp {
  private uiManager: UIManager;

  constructor() {
    this.uiManager = new UIManager();
    this.initialize();
  }

  private initialize(): void {
    Logger.info("🚀 Weather App initialized");
  }
}

// Initialize the application when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  new WeatherApp();
});
