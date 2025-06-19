import { UserService } from "../services/user-service.js";
import { WeatherService } from "../services/weather-service.js";
import { UserWeatherConverter } from "../converters/user-weather-converter.js";
import { UserCardRenderer } from "./user-card-renderer.js";
import { CacheManager } from "../utils/cache-manager.js";
import { AutoRefreshManager } from "../utils/auto-refresh-manager.js";
import { APP_CONSTANTS } from "../config/constants.js";
import { Logger } from "../utils/logger.js";
/**
 * Main UI manager for handling DOM interactions and user events
 */
export class UIManager {
    constructor() {
        this.userCardsContainer = document.getElementById("userCards");
        this.refreshWeatherBtn = document.getElementById("refreshWeather");
        this.newUsersBtn = document.getElementById("newUsers");
        // Initialize auto-refresh manager
        this.autoRefreshManager = new AutoRefreshManager(() => this.refreshWeather(true), // auto-refresh
        APP_CONSTANTS.AUTO_REFRESH_INTERVAL // 30 minutes
        );
        this.currentUserData = []; // current user data for caching
        this.initializeEventListeners();
        this.loadFromCache();
    }
    /**
     * Initialize event listeners
     */
    initializeEventListeners() {
        this.refreshWeatherBtn.addEventListener("click", () => this.refreshWeather(false));
        this.newUsersBtn.addEventListener("click", () => this.fetchNewUsers());
        // Handle page visibility change to pause/resume auto-refresh
        document.addEventListener("visibilitychange", () => {
            if (document.hidden) {
                Logger.info("🔄 Page hidden - auto-refresh continues in background");
            }
            else {
                Logger.info("👁️ Page visible - checking if refresh needed");
                this.checkAndRefreshIfNeeded();
            }
        });
        // Handle beforeunload to clean up
        window.addEventListener("beforeunload", () => {
            this.autoRefreshManager.stop();
        });
    }
    /**
     * Load data from cache on initialization
     */
    async loadFromCache() {
        Logger.info("🔄 Loading application data...");
        // Try to load cached users first
        const cachedUsers = UserService.getCachedUsers();
        if (cachedUsers && cachedUsers.length > 0) {
            Logger.info(`📦 Found ${cachedUsers.length} cached users`);
            // Try to load cached weather data
            const cachedWeatherData = CacheManager.getItem(CacheManager.CACHE_KEYS.WEATHER);
            if (cachedWeatherData) {
                Logger.info("📦 Found cached weather data");
                await this.renderFromCache(cachedUsers, cachedWeatherData);
                // Start auto-refresh
                this.autoRefreshManager.start();
                // Check if we need to refresh weather data
                if (CacheManager.shouldRefreshWeather()) {
                    Logger.info("🔄 Cached weather data is stale, refreshing...");
                    this.refreshWeather(true);
                }
                return;
            }
        }
        // No cached data available, fetch fresh data
        Logger.info("📡 No valid cache found, fetching fresh data...");
        await this.fetchNewUsers();
    }
    /**
     * Render UI from cached data
     */
    async renderFromCache(users, weatherDataArray) {
        this.clearUserCards();
        this.currentUserData = [];
        for (let i = 0; i < users.length; i++) {
            const user = users[i];
            const weatherData = weatherDataArray[i] || null;
            const userWeatherData = {
                user,
                weather: weatherData,
            };
            this.currentUserData.push(userWeatherData);
            await this.addUserCard(userWeatherData);
        }
        Logger.success(`✅ Rendered ${users.length} users from cache`);
    }
    /**
     * Fetch new users and their weather data
     */
    async fetchNewUsers() {
        try {
            Logger.info("👥 Fetching new users...");
            const users = await UserService.fetchFreshUsers(APP_CONSTANTS.DEFAULT_USER_COUNT);
            this.clearUserCards();
            this.currentUserData = [];
            // Stop auto-refresh during user fetch
            this.autoRefreshManager.stop();
            for (const user of users) {
                try {
                    const userWeatherData = await UserWeatherConverter.convertUserToUserWeatherData(user);
                    this.currentUserData.push(userWeatherData);
                    await this.addUserCard(userWeatherData);
                }
                catch (error) {
                    Logger.error("Error processing user:", error);
                    const fallbackData = {
                        user,
                        weather: null,
                    };
                    this.currentUserData.push(fallbackData);
                    await this.addUserCard(fallbackData);
                }
            }
            // Cache the complete data
            this.cacheCurrentData();
            // Start auto-refresh
            this.autoRefreshManager.start();
        }
        catch (error) {
            Logger.error("Error fetching users:", error);
            this.showError("Failed to fetch users. Please try again.");
        }
    }
    /**
     * Refresh weather data for all user cards
     */
    async refreshWeather(isAutoRefresh = false) {
        try {
            const refreshType = isAutoRefresh ? "Auto-refresh" : "Manual refresh";
            Logger.info(`🔄 ${refreshType} weather update started`);
            const cards = this.getAllUserCards();
            if (!cards.length) {
                Logger.warn("No user cards found to refresh weather for");
                return;
            }
            let successCount = 0;
            const weatherDataArray = [];
            for (let i = 0; i < cards.length; i++) {
                const card = cards[i];
                const coordinates = this.getCardCoordinates(card);
                if (!coordinates.lat || !coordinates.lng) {
                    Logger.warn("Missing coordinates for card:", card);
                    weatherDataArray.push(null);
                    continue;
                }
                try {
                    Logger.weatherRefresh(coordinates.lat, coordinates.lng);
                    // Get cached weather data for fallback
                    const cachedWeatherData = CacheManager.getItem(CacheManager.CACHE_KEYS.WEATHER);
                    const fallbackWeather = cachedWeatherData && cachedWeatherData[i]
                        ? cachedWeatherData[i]
                        : null;
                    // Try to get fresh weather data with fallback
                    const weather = await WeatherService.getWeatherWithFallback(coordinates.lat, coordinates.lng, fallbackWeather);
                    UserCardRenderer.updateWeatherInfo(card, weather);
                    weatherDataArray.push(weather);
                    // Update current user data
                    if (this.currentUserData[i]) {
                        this.currentUserData[i].weather = weather;
                    }
                    successCount++;
                    Logger.success(`Weather updated successfully for ${card.querySelector(".user-card__name")?.textContent}`);
                }
                catch (error) {
                    Logger.error("Error refreshing weather for card:", error);
                    UserCardRenderer.updateWeatherInfo(card, null);
                    weatherDataArray.push(null);
                }
            }
            // Cache the updated weather data
            if (weatherDataArray.some((data) => data !== null)) {
                CacheManager.setItem(CacheManager.CACHE_KEYS.WEATHER, weatherDataArray);
                CacheManager.setItem(CacheManager.CACHE_KEYS.LAST_FETCH, Date.now());
            }
            Logger.summary(successCount, cards.length);
            if (isAutoRefresh) {
                Logger.info("⏰ Auto-refresh completed");
            }
        }
        catch (error) {
            Logger.error("Error in refreshWeather:", error);
            if (!isAutoRefresh) {
                this.showError("Failed to refresh weather data. Please try again.");
            }
        }
    }
    /**
     * Check if refresh is needed and refresh if necessary
     */
    async checkAndRefreshIfNeeded() {
        if (CacheManager.shouldRefreshWeather()) {
            Logger.info("🔄 Refresh needed due to stale data");
            await this.refreshWeather(true);
        }
    }
    /**
     * Cache current user and weather data
     */
    cacheCurrentData() {
        if (this.currentUserData.length === 0) {
            return;
        }
        const users = this.currentUserData.map((item) => item.user);
        const weatherData = this.currentUserData.map((item) => item.weather);
        CacheManager.setItem(CacheManager.CACHE_KEYS.USERS, users);
        CacheManager.setItem(CacheManager.CACHE_KEYS.WEATHER, weatherData);
        CacheManager.setItem(CacheManager.CACHE_KEYS.LAST_FETCH, Date.now());
        Logger.info("💾 Cached current user and weather data");
    }
    /**
     * Clear all user cards from the container
     */
    clearUserCards() {
        this.userCardsContainer.innerHTML = "";
    }
    /**
     * Add a new user card to the container
     */
    async addUserCard(userWeatherData) {
        const card = await UserCardRenderer.createUserCard(userWeatherData);
        this.userCardsContainer.appendChild(card);
    }
    /**
     * Get all user card elements
     */
    getAllUserCards() {
        return Array.from(this.userCardsContainer.querySelectorAll(".user-card"));
    }
    /**
     * Get coordinates from a user card
     */
    getCardCoordinates(card) {
        return {
            lat: parseFloat(card.dataset.lat || "0"),
            lng: parseFloat(card.dataset.lng || "0"),
        };
    }
    /**
     * Show error message to user
     */
    showError(message) {
        // You can implement a more sophisticated error display mechanism here
        alert(message);
    }
}
//# sourceMappingURL=ui-manager.js.map