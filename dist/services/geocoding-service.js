import { API_CONFIG } from "../config/constants.js";
/**
 * Simple geocoding service using OpenCage API for better reliability
 */
export class GeocodingService {
    /**
     * Get coordinates for a location (e.g., "London, UK")
     */
    static async getCoordinates(locationQuery) {
        const response = await fetch(`https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(locationQuery)}&key=${API_CONFIG.OPENCAGE_API_KEY}`);
        if (!response.ok) {
            throw new Error(`Geocoding failed: ${response.status}`);
        }
        const data = await response.json();
        if (!data.results || data.results.length === 0) {
            throw new Error(`No coordinates found for ${locationQuery}`);
        }
        const { lat, lng } = data.results[0].geometry;
        return {
            lat,
            lng,
        };
    }
}
//# sourceMappingURL=geocoding-service.js.map