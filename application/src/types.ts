// Import user roles
import { USER_ROLES } from 'lib/auth/roles';

/**
 * User type definition
 * Represents a user in our system with all relevant properties
 */
export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  image: string | null;

  role: UserRole;
  createdAt: Date;

  verificationToken?: string | null;
  emailVerified: boolean;
}

/**
 * Subscription type definition
 * Represents a user's subscription plan and status
 */
export interface Subscription {
  id: string;
  userId: string;
  status: SubscriptionStatus | null;
  plan: SubscriptionPlan | null;
  customerId: string | null;
  createdAt: Date;
}

/**
 * Note type definition
 * Represents a note created by a user
 */
export interface Note {
  id: string;
  userId: string;
  title: string;
  content: string;
  createdAt: Date;
}

// Type for user roles
export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

// Type for subscription status
export type SubscriptionStatus = 'ACTIVE' | 'CANCELED' | 'PENDING';

// Type for subscription plans
export type SubscriptionPlan = 'FREE' | 'PRO';

/**
 * Extended user type that includes subscription information
 * Useful for API responses that need to include subscription data
 */
export interface UserWithSubscriptions extends User {
  subscription: Subscription | null;
}

/**
 * Subscription status enum
 * Provides a consistent way to reference subscription statuses
 */
export enum SubscriptionStatusEnum {
  ACTIVE = 'ACTIVE',
  CANCELED = 'CANCELED',
  PENDING = 'PENDING',
}

/**
 * Subscription plan enum
 * Provides a consistent way to reference subscription plans
 */
export enum SubscriptionPlanEnum {
  FREE = 'FREE',
  PRO = 'PRO',
}