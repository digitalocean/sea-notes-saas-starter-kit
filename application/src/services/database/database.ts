import { Environment, Subscription, User, UserWithSubscriptions, SubscriptionStatus } from 'types';
import { ServiceConfigStatus, ConfigurableService } from '../status/serviceConfigStatus';

export type DatabaseProvider = 'Postgres';

export type QueryParams = unknown[];

/**
 * Abstract base class for database clients.
 * Provides a common interface for database operations across different database providers.
 */
export abstract class DatabaseClient implements ConfigurableService {
  abstract user: {
    findById: (id: string) => Promise<User | null>;
    findByEmail: (email: string) => Promise<User | null>;
    findByEmailAndPassword: (email: string, passwordHash: string) => Promise<User | null>;
    findByVerificationToken: (token: string) => Promise<User | null>;
    findAll: (options?: {
      page?: number;
      pageSize?: number;
      searchName?: string;
      filterPlan?: string;
      filterStatus?: string;
    }) => Promise<{ users: UserWithSubscriptions[]; total: number }>;
    create: (user: Omit<User, 'id' | 'createdAt'>) => Promise<User>;
    update: (id: string, user: Partial<Omit<User, 'id' | 'createdAt'>>) => Promise<User>;
    delete: (id: string) => Promise<void>;
    count: () => Promise<number>;
    updateByEmail: (email: string, user: Partial<Omit<User, 'id' | 'createdAt'>>) => Promise<User>;
  };
  abstract subscription: {
    findByUserAndStatus: (
      userId: string,
      status: SubscriptionStatus
    ) => Promise<Subscription | null>;
    findById: (id: string) => Promise<Subscription | null>;
    findByUserId: (userId: string) => Promise<Subscription[]>;
    create: (subscription: Omit<Subscription, 'id' | 'createdAt'>) => Promise<Subscription>;
    update: (
      userId: string,
      subscription: Partial<Omit<Subscription, 'id' | 'createdAt'>>
    ) => Promise<Subscription>;
    updateByCustomerId: (
      customerId: string,
      subscription: Partial<Omit<Subscription, 'id' | 'createdAt'>>
    ) => Promise<Subscription>;
    delete: (id: string) => Promise<void>;
  };
  abstract environment: {
    findById: (id: string) => Promise<Environment | null>;
    findByUserId: (userId: string) => Promise<Environment[]>;
    create: (environment: Omit<Environment, 'id' | 'createdAt'>) => Promise<Environment>;
    update: (id: string, environment: Partial<Omit<Environment, 'id' | 'createdAt'>>) => Promise<Environment>;
    delete: (id: string) => Promise<void>;
    findMany: (args: {
      search?: string;
      userId: string;
      skip: number;
      take: number;
      orderBy: {
        createdAt?: 'desc' | 'asc';
        name?: 'asc';
      };
    }) => Promise<Environment[]>;
    count: (userId: string, search?: string) => Promise<number>;
  };
  abstract verificationToken: {
    create: (data: { identifier: string; token: string; expires: Date }) => Promise<void>;
    find: (
      identifier: string,
      token: string
    ) => Promise<{ identifier: string; token: string; expires: Date } | null>;
    findByToken: (
      token: string
    ) => Promise<{ identifier: string; token: string; expires: Date } | null>;
    delete: (identifier: string, token: string) => Promise<void>;
    deleteExpired: (now: Date) => Promise<void>;
  };
  abstract checkConnection(): Promise<boolean>;

  abstract checkConfiguration(): Promise<ServiceConfigStatus>;

  /**
   * Default implementation: database services are required by default.
   * Override this method if a specific database implementation should be optional.
   */
  isRequired(): boolean {
    return true;
  }
}
