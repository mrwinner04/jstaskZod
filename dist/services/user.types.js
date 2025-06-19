// Pure utility functions for user data operations (no API calls)
export class UserUtils {
    // Get full name from user data
    static getFullName(user) {
        return `${user.name.first} ${user.name.last}`;
    }
    // Get location display string
    static getLocationDisplay(user) {
        return `${user.location.city}, ${user.location.country}`;
    }
    // Get search query string for geocoding services
    static getLocationQuery(user) {
        return `${user.location.city}, ${user.location.country}`;
    }
}
//# sourceMappingURL=user.types.js.map