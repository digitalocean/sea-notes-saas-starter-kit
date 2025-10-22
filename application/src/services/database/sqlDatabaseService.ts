// Import database client and Prisma
import { DatabaseClient } from './database';
import { prisma } from '../../lib/prisma';
import { Subscription, Note, User, UserWithSubscriptions, SubscriptionStatus } from 'types';
import { PrismaClient } from '@prisma/client';
import { ServiceConfigStatus } from '../status/serviceConfigStatus';

/**
 * Service for interacting with the SQL database using Prisma
 * Implements all the required database operations for users, subscriptions, notes, and verification tokens
 */
export class SqlDatabaseService extends DatabaseClient {
  // Service name for consistent display across all status responses
  private static readonly serviceName = 'Database (PostgreSQL)';
  private description: string =
    'The following features are impacted: overall app functionality, user, subscription and notes management';

  // Required config items with their corresponding env var names and descriptions
  private static requiredConfig = {
    databaseUrl: { envVar: 'DATABASE_URL', description: 'PostgreSQL connection string' },
  };
  private lastConnectionError: string = '';

  constructor() {
    super();
  }

  /**
   * User-related database operations
   */
  user = {
    /**
     * Find a user by their ID
     */
    findById: async (id: string) => {
      return prisma.user.findUnique({ where: { id } });
    },
    
    /**
     * Find a user by their email address
     */
    findByEmail: async (email: string) => {
      return prisma.user.findUnique({ where: { email } });
    },
    
    /**
     * Find a user by email and password hash
     */
    findByEmailAndPassword: async (email: string, passwordHash: string) => {
      return prisma.user.findFirst({ where: { email, passwordHash } });
    },
    
    /**
     * Find a user by their verification token
     */
    findByVerificationToken: async (token: string) => {
      return prisma.user.findFirst({ where: { verificationToken: token } });
    },
    
    /**
     * Find all users with optional pagination and filtering
     */
    findAll: async (options?: {
      page?: number;
      pageSize?: number;
      searchName?: string;
      filterPlan?: string;
      filterStatus?: string;
    }): Promise<{ users: UserWithSubscriptions[]; total: number }> => {
      const page = options?.page || 1;
      const pageSize = options?.pageSize || 10;
      const skip = (page - 1) * pageSize;
      const where: Record<string, unknown> = {};
      
      // Apply search filter by name
      if (options?.searchName) {
        where.name = { contains: options.searchName, mode: 'insensitive' };
      }
      
      // Apply plan and status filters
      if (options?.filterPlan || options?.filterStatus) {
        where.subscription = { plan: {}, status: {} };
        if (options.filterPlan) {
          (where.subscription as { plan: Record<string, unknown> }).plan = {
            equals: options.filterPlan,
          };
        }
        if (options.filterStatus) {
          (where.subscription as { status: Record<string, unknown> }).status = {
            equals: options.filterStatus,
          };
        }
      }

      // Get users and total count in parallel for better performance
      const [users, total] = await Promise.all([
        prisma.user.findMany({
          where,
          include: { subscription: true },
          orderBy: { name: 'asc' },
          skip,
          take: pageSize,
        }),
        prisma.user.count({ where }),
      ]);
      
      return { users, total };
    },
    
    /**
     * Create a new user
     */
    create: async (user: Omit<User, 'id' | 'createdAt'>): Promise<User> => {
      const newUser = await prisma.user.create({ data: user });
      return newUser;
    },
    
    /**
     * Update a user by ID
     */
    update: async (id: string, user: Partial<Omit<User, 'id' | 'createdAt'>>): Promise<User> => {
      return prisma.user.update({ where: { id }, data: user });
    },
    
    /**
     * Update a user by email
     */
    updateByEmail: async (
      email: string,
      user: Partial<Omit<User, 'id' | 'createdAt'>>
    ): Promise<User> => {
      return prisma.user.update({ where: { email }, data: user });
    },
    
    /**
     * Delete a user by ID
     */
    delete: async (id: string): Promise<void> => {
      await prisma.user.delete({ where: { id } });
    },
    
    /**
     * Count total number of users
     */
    count: async (): Promise<number> => {
      return prisma.user.count();
    },
  };
  
  /**
   * Subscription-related database operations
   */
  subscription = {
    /**
     * Find a subscription by user ID and status
     */
    findByUserAndStatus: async (
      userId: string,
      status: SubscriptionStatus
    ): Promise<Subscription | null> => {
      return prisma.subscription.findFirst({
        where: { userId, status },
      });
    },
    
    /**
     * Find a subscription by ID
     */
    findById: async (id: string): Promise<Subscription | null> => {
      return prisma.subscription.findUnique({ where: { id } });
    },
    
    /**
     * Find all subscriptions for a user
     */
    findByUserId: async (userId: string): Promise<Subscription[]> => {
      return prisma.subscription.findMany({ where: { userId } });
    },
    
    /**
     * Create a new subscription
     */
    create: async (subscription: Omit<Subscription, 'id' | 'createdAt'>): Promise<Subscription> => {
      return prisma.subscription.create({ data: subscription });
    },
    
    /**
     * Update a subscription by user ID
     */
    update: async (
      userId: string,
      subscription: Partial<Omit<Subscription, 'id' | 'createdAt'>>
    ): Promise<Subscription> => {
      return prisma.subscription.update({ where: { userId }, data: subscription });
    },
    
    /**
     * Update a subscription by customer ID
     */
    updateByCustomerId: async (
      customerId: string,
      subscription: Partial<Omit<Subscription, 'id' | 'createdAt'>>
    ): Promise<Subscription> => {
      const existing = await prisma.subscription.findFirst({ where: { customerId } });
      if (!existing) throw new Error('Subscription not found for customerId');
      return prisma.subscription.update({ where: { id: existing.id }, data: subscription });
    },
    
    /**
     * Delete a subscription by ID
     */
    delete: async (id: string): Promise<void> => {
      await prisma.subscription.delete({ where: { id } });
    },
  };
  
  /**
   * Note-related database operations
   */
  note = {
    /**
     * Find a note by ID
     */
    findById: async (id: string): Promise<Note | null> => {
      return prisma.note.findUnique({ where: { id } });
    },
    
    /**
     * Find all notes for a user
     */
    findByUserId: async (userId: string): Promise<Note[]> => {
      return prisma.note.findMany({ where: { userId } });
    },
    
    /**
     * Create a new note
     */
    create: async (note: Omit<Note, 'id' | 'createdAt'>): Promise<Note> => {
      return prisma.note.create({ data: note });
    },
    
    /**
     * Update a note by ID
     */
    update: async (id: string, note: Partial<Omit<Note, 'id' | 'createdAt'>>): Promise<Note> => {
      return prisma.note.update({ where: { id }, data: note });
    },
    
    /**
     * Delete a note by ID
     */
    delete: async (id: string): Promise<void> => {
      await prisma.note.delete({ where: { id } });
    },
    
    /**
     * Find many notes with search and pagination
     */
    findMany: async (args: {
      userId: string;
      search?: string;
      skip: number;
      take: number;
      orderBy: {
        createdAt?: 'desc' | 'asc';
        title?: 'asc';
      };
    }) => {
      const { userId, search, skip, take, orderBy } = args;
      return prisma.note.findMany({
        where: {
          userId,
          ...(search
            ? {
                OR: [
                  { title: { contains: search, mode: 'insensitive' } },
                  { content: { contains: search, mode: 'insensitive' } },
                ],
              }
            : {}),
        },
        skip,
        take,
        orderBy,
      });
    },
    
    /**
     * Count notes for a user with optional search
     */
    count: async (userId: string, search?: string) => {
      return prisma.note.count({
        where: {
          userId,
          ...(search
            ? {
                OR: [
                  { title: { contains: search, mode: 'insensitive' } },
                  { content: { contains: search, mode: 'insensitive' } },
                ],
              }
            : {}),
        },
      });
    },
  };
  
  /**
   * Verification token-related database operations
   */
  verificationToken = {
    /**
     * Create a new verification token
     */
    create: async (data: { identifier: string; token: string; expires: Date }) => {
      await prisma.verificationToken.create({ data });
    },
    
    /**
     * Find a verification token by identifier and token
     */
    find: async (identifier: string, token: string) => {
      return prisma.verificationToken.findUnique({
        where: { identifier_token: { identifier, token } },
      });
    },
    
    /**
     * Find a verification token by token only
     */
    findByToken: async (token: string) => {
      return prisma.verificationToken.findFirst({ where: { token } });
    },
    
    /**
     * Delete a verification token by identifier and token
     */
    delete: async (identifier: string, token: string) => {
      await prisma.verificationToken.delete({
        where: { identifier_token: { identifier, token } },
      });
    },
    
    /**
     * Delete all expired verification tokens
     */
    deleteExpired: async (now: Date) => {
      await prisma.verificationToken.deleteMany({
        where: { expires: { lt: now } },
      });
    },
  };
  
  /**
   * Checks if the database service is properly configured and accessible
   * Tests the connection by performing a simple query
   * Creates a fresh Prisma client to test the current DATABASE_URL
   *
   * @returns True if the connection is successful, false otherwise
   */
  async checkConnection(): Promise<boolean> {
    let testClient: PrismaClient | null = null;

    try {
      // Create a fresh Prisma client to test the current DATABASE_URL
      // This ensures we're testing with the latest environment variable value
      testClient = new PrismaClient({
        datasources: {
          db: {
            url: process.env.DATABASE_URL,
          },
        },
      });

      // Test connection by performing a simple query
      await testClient.$queryRaw`SELECT 1`;
      return true;
    } catch (connectionError) {
      const errorMsg =
        connectionError instanceof Error ? connectionError.message : String(connectionError);

      console.error('Database connection test failed:', {
        error: errorMsg,
        databaseUrl: process.env.DATABASE_URL ? 'SET' : 'NOT SET',
      });

      this.lastConnectionError = `Connection error: ${errorMsg}`;
      return false;
    } finally {
      // Always disconnect the test client to avoid connection leaks
      if (testClient) {
        await testClient.$disconnect();
      }
    }
  }

  /**
   * Checks if the database service configuration is valid and tests connection when configuration is complete
   */
  async checkConfiguration(): Promise<ServiceConfigStatus> {
    // Check for missing configuration
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      return {
        name: SqlDatabaseService.serviceName,
        configured: false,
        connected: undefined, // Don't test connection when configuration is missing
        configToReview: ['DATABASE_URL'],
        error: 'Configuration missing',
        description: this.description,
      };
    }

    // If configured, test the connection
    const isConnected = await this.checkConnection();
    if (!isConnected) {
      return {
        name: SqlDatabaseService.serviceName,
        configured: true,
        connected: false,
        configToReview: ['DATABASE_URL'],
        error: this.lastConnectionError || 'Connection failed',
        description: this.description,
      };
    }
    
    return {
      name: SqlDatabaseService.serviceName,
      configured: true,
      connected: true,
    };
  }
}