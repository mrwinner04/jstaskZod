import { z } from "zod";
/**
 * Zod schema for user name structure
 * Validates that both first and last names are non-empty strings
 */
export const UserNameSchema = z.object({
    first: z.string().min(1, "First name cannot be empty").trim(),
    last: z.string().min(1, "Last name cannot be empty").trim(),
});
/**
 * Zod schema for user location structure
 * Validates city and country as non-empty strings
 */
export const UserLocationSchema = z.object({
    city: z.string().min(1, "City cannot be empty").trim(),
    country: z.string().min(1, "Country cannot be empty").trim(),
});
/**
 * Zod schema for user picture structure
 * Validates that the large picture URL is a valid URL
 */
export const UserPictureSchema = z.object({
    large: z.string().url("Picture URL must be a valid URL"),
});
/**
 * Main Zod schema for a single user
 * Combines all user data validation rules
 */
export const UserSchema = z.object({
    name: UserNameSchema,
    location: UserLocationSchema,
    picture: UserPictureSchema,
});
/**
 * Zod schema for the API response from randomuser.me
 * Validates the entire response structure including the results array
 */
export const UserApiResponseSchema = z.object({
    results: z
        .array(UserSchema)
        .min(1, "API response must contain at least one user"),
    info: z
        .object({
        seed: z.string().optional(),
        results: z.number().optional(),
        page: z.number().optional(),
        version: z.string().optional(),
    })
        .optional(),
});
/**
 * Zod schema for an array of users
 * Used for validating cached user data
 */
export const UsersArraySchema = z
    .array(UserSchema)
    .min(1, "Users array cannot be empty");
/**
 * Utility class for user data validation and operations
 * Now includes both validation and business logic
 */
export class UserValidator {
    /**
     * Validate a single user object
     * @param data - Raw user data to validate
     * @returns Validated user object
     * @throws ZodError if validation fails
     */
    static validateUser(data) {
        return UserSchema.parse(data);
    }
    /**
     * Validate an array of users
     * @param data - Raw users array to validate
     * @returns Validated users array
     * @throws ZodError if validation fails
     */
    static validateUsers(data) {
        return UsersArraySchema.parse(data);
    }
    /**
     * Validate API response from randomuser.me
     * @param data - Raw API response to validate
     * @returns Validated API response
     * @throws ZodError if validation fails
     */
    static validateApiResponse(data) {
        return UserApiResponseSchema.parse(data);
    }
    /**
     * Safely validate user data with error handling
     * @param data - Raw user data to validate
     * @returns Success result with user or error result
     */
    static safeValidateUser(data) {
        const result = UserSchema.safeParse(data);
        if (result.success) {
            return { success: true, data: result.data, error: null };
        }
        return {
            success: false,
            data: null,
            error: `User validation failed: ${result.error.message}`,
        };
    }
    /**
     * Safely validate users array with error handling
     * @param data - Raw users array to validate
     * @returns Success result with users or error result
     */
    static safeValidateUsers(data) {
        const result = UsersArraySchema.safeParse(data);
        if (result.success) {
            return { success: true, data: result.data, error: null };
        }
        return {
            success: false,
            data: null,
            error: `Users validation failed: ${result.error.message}`,
        };
    }
}
/**
 * Enhanced user utility functions with validation
 * Extends the original UserUtils with Zod validation
 */
export class UserUtils {
    /**
     * Get full name from validated user data
     * @param user - Validated user object
     * @returns Full name string
     */
    static getFullName(user) {
        // Additional runtime validation to ensure data integrity
        const validatedUser = UserValidator.validateUser(user);
        return `${validatedUser.name.first} ${validatedUser.name.last}`;
    }
    /**
     * Get location display string from validated user data
     * @param user - Validated user object
     * @returns Location display string
     */
    static getLocationDisplay(user) {
        const validatedUser = UserValidator.validateUser(user);
        return `${validatedUser.location.city}, ${validatedUser.location.country}`;
    }
    /**
     * Get search query string for geocoding services
     * @param user - Validated user object
     * @returns Location query string for geocoding
     */
    static getLocationQuery(user) {
        const validatedUser = UserValidator.validateUser(user);
        return `${validatedUser.location.city}, ${validatedUser.location.country}`;
    }
    /**
     * Validate and sanitize user input data
     * @param userData - Raw user data
     * @returns Sanitized and validated user data
     */
    static sanitizeUserData(userData) {
        return UserValidator.validateUser(userData);
    }
}
//# sourceMappingURL=user.schemas.js.map