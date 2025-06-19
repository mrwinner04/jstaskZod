export interface User {
  name: {
    first: string;
    last: string;
  };
  location: {
    city: string;
    country: string;
  };
  picture: {
    large: string;
  };
}

// Pure utility functions for user data operations (no API calls)
export class UserUtils {
  // Get full name from user data
  static getFullName(user: User): string {
    return `${user.name.first} ${user.name.last}`;
  }

  // Get location display string
  static getLocationDisplay(user: User): string {
    return `${user.location.city}, ${user.location.country}`;
  }

  // Get search query string for geocoding services
  static getLocationQuery(user: User): string {
    return `${user.location.city}, ${user.location.country}`;
  }
}
