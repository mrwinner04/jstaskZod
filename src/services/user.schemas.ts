import { z } from "zod";

export const UserSchema = z.object({
  name: z.object({
    first: z.string().min(1).trim(),
    last: z.string().min(1).trim(),
  }),
  location: z.object({
    city: z.string().min(1).trim(),
    country: z.string().min(1).trim(),
  }),
  picture: z.object({
    large: z.string().url(),
  }),
});

export const UserApiResponseSchema = z.object({
  results: z.array(UserSchema).min(1),
});

export type User = z.infer<typeof UserSchema>;
export type UserApiResponse = z.infer<typeof UserApiResponseSchema>;

export const validateUser = (data: Record<string, any>): User =>
  UserSchema.parse(data);
export const validateApiResponse = (
  data: Record<string, any>
): UserApiResponse => UserApiResponseSchema.parse(data);

export const getFullName = (user: User): string =>
  `${user.name.first} ${user.name.last}`;
export const getLocationDisplay = (user: User): string =>
  `${user.location.city}, ${user.location.country}`;
export const getLocationQuery = (user: User): string =>
  `${user.location.city}, ${user.location.country}`;
