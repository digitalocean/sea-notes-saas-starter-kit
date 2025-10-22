// Import user role types
import { UserRole } from 'types';

/**
 * User roles configuration
 * We have two roles: ADMIN and USER
 * This makes it easy to extend with more roles in the future
 */
export const USER_ROLES = {
  ADMIN: 'ADMIN',
  USER: 'USER',
} as const;

// Array of all available roles
export const ALL_ROLES: UserRole[] = Object.values(USER_ROLES);