/* eslint-disable @typescript-eslint/no-explicit-any */
import { StatusService } from './statusService';
import { serverConfig } from '../../settings';
import { StorageService } from '../storage/storage';
import { EmailService } from '../email/email';
import { DatabaseClient } from '../database/database';

// Create proper mock interfaces
// Create mock instances with proper type casting
const mockStorageService = {
  checkConnection: jest.fn(),
  checkConfiguration: jest.fn(),
  uploadFile: jest.fn(),
  getFileUrl: jest.fn(),
  deleteFile: jest.fn(),
  isRequired: jest.fn().mockReturnValue(false),
} as jest.Mocked<StorageService>;

const mockEmailService = {
  checkConfiguration: jest.fn(),
  checkConnection: jest.fn(),
  sendReactEmail: jest.fn(),
  isRequired: jest.fn().mockReturnValue(true),
} as jest.Mocked<EmailService>;

const mockDatabaseService = {
  checkConnection: jest.fn(),
  checkConfiguration: jest.fn(),
  isRequired: jest.fn().mockReturnValue(true),
  // Mock the nested properties that are required by DatabaseClient
  user: {} as any,
  subscription: {} as any,
  note: {} as any,
} as jest.Mocked<DatabaseClient>;

const mockBillingService = {
  listCustomer: jest.fn(),
  createCustomer: jest.fn(),
  listSubscription: jest.fn(),
  createSubscription: jest.fn(),
  cancelSubscription: jest.fn(),
  updateSubscription: jest.fn(),
  manageSubscription: jest.fn(),
  getProducts: jest.fn(),
  checkConnection: jest.fn(),
  checkConfiguration: jest.fn(),
  isRequired: jest.fn().mockReturnValue(false),
} as jest.Mocked<BillingService>;

const mockAuthService = {
  checkConfiguration: jest.fn(),
  checkConnection: jest.fn(),
  isRequired: jest.fn().mockReturnValue(true),
} as jest.Mocked<AuthService>;

// Mock the factory functions - fix hoisting issue by putting mocks after declarations
jest.mock('../storage/storageFactory');
jest.mock('../email/emailFactory');
jest.mock('../database/databaseFactory');
jest.mock('../billing/billingFactory');
jest.mock('../billing/billingFactory');
jest.mock('../auth/authFactory');

// Import the mocked functions
import { createStorageService } from '../storage/storageFactory';
import { createEmailService } from '../email/emailFactory';
import { createDatabaseService } from '../database/databaseFactory';
import { createBillingService } from 'services/billing/billingFactory';
import { BillingService } from 'services/billing/billing';
import { AuthService } from 'services/auth/auth';
import { createAuthService } from 'services/auth/authFactory';

// Cast to jest mocks
const mockCreateStorageService = createStorageService as jest.MockedFunction<
  typeof createStorageService
>;
const mockCreateEmailService = createEmailService as jest.MockedFunction<typeof createEmailService>;
const mockCreateDatabaseService = createDatabaseService as jest.MockedFunction<
  typeof createDatabaseService
>;
const mockCreateBillingService = createBillingService as jest.MockedFunction<
  typeof createBillingService
>;

const mockCreateAuthService = createAuthService as jest.MockedFunction<typeof createAuthService>;

describe('StatusService', () => {
  const originalConfig = {
    storageProvider: serverConfig.storageProvider,
    accessKey: serverConfig.Spaces.SEANOTES_SPACES_KEY_ID,
    secretKey: serverConfig.Spaces.SEANOTES_SPACES_KEY_SECRET,
    bucketName: serverConfig.Spaces.SEANOTES_SPACES_BUCKET_NAME,
    region: serverConfig.Spaces.SEANOTES_SPACES_REGION,
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Set up mocks to return our mock service instances
    mockCreateStorageService.mockResolvedValue(mockStorageService);
    mockCreateEmailService.mockResolvedValue(mockEmailService);
    mockCreateDatabaseService.mockResolvedValue(mockDatabaseService);
    mockCreateBillingService.mockResolvedValue(mockBillingService);
    mockCreateAuthService.mockResolvedValue(mockAuthService);

    // Reset static state using proper type casting (since we don't have resetForTesting method)
    (StatusService as any).cachedHealthState = null;
    (StatusService as any).isInitialized = false;
    (StatusService as unknown as { isInitialized: boolean }).isInitialized = false;

    // Set default mock values for testing
    serverConfig.storageProvider = 'Spaces';
    serverConfig.Spaces.SEANOTES_SPACES_KEY_ID = 'test-access-key';
    serverConfig.Spaces.SEANOTES_SPACES_KEY_SECRET = 'test-secret-key';
    serverConfig.Spaces.SEANOTES_SPACES_BUCKET_NAME = 'test-bucket';
    serverConfig.Spaces.SEANOTES_SPACES_REGION = 'test-region';

    // Setup default mock responses
    mockStorageService.checkConfiguration.mockResolvedValue({
      name: 'Storage Service',
      configured: true,
      connected: true,
      error: undefined,
      configToReview: undefined,
    });

    mockEmailService.checkConfiguration.mockResolvedValue({
      name: 'Email Service',
      configured: true,
      connected: true,
      error: undefined,
      configToReview: undefined,
    });

    mockDatabaseService.checkConfiguration.mockResolvedValue({
      name: 'Database Service',
      configured: true,
      connected: true,
      error: undefined,
      configToReview: undefined,
    });

    mockBillingService.checkConfiguration.mockResolvedValue({
      name: 'Billing Service',
      configured: true,
      connected: true,
      error: undefined,
      configToReview: undefined,
    });

    mockAuthService.checkConfiguration.mockResolvedValue({
      name: 'Auth Service',
      configured: true,
      connected: true,
      error: undefined,
      configToReview: undefined,
    });
  });

  afterAll(() => {
    // Restore original config
    serverConfig.storageProvider = originalConfig.storageProvider;
    serverConfig.Spaces.SEANOTES_SPACES_KEY_ID = originalConfig.accessKey;
    serverConfig.Spaces.SEANOTES_SPACES_KEY_SECRET = originalConfig.secretKey;
    serverConfig.Spaces.SEANOTES_SPACES_BUCKET_NAME = originalConfig.bucketName;
    serverConfig.Spaces.SEANOTES_SPACES_REGION = originalConfig.region;
  });

  describe('checkStorageStatus', () => {
    it('should report configured=true and connected=true when all is well', async () => {
      // Arrange
      mockStorageService.checkConfiguration.mockResolvedValue({
        name: 'Storage Service',
        configured: true,
        connected: true,
        error: undefined,
        configToReview: undefined,
      });

      // Act
      const result = await StatusService.checkStorageStatus();

      // Assert
      expect(result.configured).toBe(true);
      expect(result.connected).toBe(true);
      expect(result.error).toBeUndefined();
      expect(createStorageService).toHaveBeenCalled();
    });
    it('should report configured=false when configuration is missing', async () => {
      // Arrange
      mockStorageService.checkConfiguration.mockResolvedValue({
        name: 'Storage Service',
        configured: false,
        connected: false,
        error: 'Missing configuration',
        configToReview: ['SPACES_KEY'],
      });

      // Act
      const result = await StatusService.checkStorageStatus();

      // Assert
      expect(result.configured).toBe(false);
      expect(result.connected).toBe(false);
      expect(result.error).toBe('Missing configuration');
      expect(result.configToReview).toEqual(['SPACES_KEY']);
    });

    it('should report connected=false when connection fails', async () => {
      // Arrange
      mockStorageService.checkConfiguration.mockResolvedValue({
        name: 'Storage Service',
        configured: true,
        connected: false,
        error: 'Connection failed',
        configToReview: ['SPACES_KEY'],
      });

      // Act
      const result = await StatusService.checkStorageStatus();

      // Assert
      expect(result.configured).toBe(true);
      expect(result.connected).toBe(false);
      expect(result.error).toBe('Connection failed');
    });
    it('should handle exceptions during storage service creation', async () => {
      // Arrange
      (createStorageService as jest.Mock).mockImplementationOnce(() => {
        throw new Error('Failed to initialize');
      });

      // Act
      const result = await StatusService.checkStorageStatus();

      // Assert
      expect(result.configured).toBe(false);
      expect(result.connected).toBe(false);
      expect(result.error).toContain('Failed to initialize storage service');
    });

    it('should handle exceptions during connection check', async () => {
      // Arrange
      mockStorageService.checkConfiguration.mockRejectedValue(new Error('Connection error'));

      // Act
      const result = await StatusService.checkStorageStatus();

      // Assert
      expect(result.configured).toBe(false);
      expect(result.connected).toBe(false);
      expect(result.error).toContain('Failed to initialize storage service');
    });
  });
  describe('checkAllServices', () => {
    it('should return an array with storage, email, database, billing and auth services status', async () => {
      // Arrange
      mockStorageService.checkConnection.mockResolvedValue(true);

      // Act
      const results = await StatusService.checkAllServices();

      // Assert
      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBe(5); // Storage + Email + Database + Billing + Auth
      expect(results.some((r) => r.name.includes('Storage'))).toBe(true);
      expect(results.some((r) => r.name.includes('Email'))).toBe(true);
      expect(results.some((r) => r.name.includes('Database'))).toBe(true);
      expect(results.some((r) => r.name.includes('Billing'))).toBe(true);
      expect(results.some((r) => r.name.includes('Auth'))).toBe(true);
    });
  });
  describe('Health State Management', () => {
    beforeEach(() => {
      // Reset static state
      (
        StatusService as unknown as { cachedHealthState: unknown; isInitialized: boolean }
      ).cachedHealthState = null;
      (StatusService as unknown as { isInitialized: boolean }).isInitialized = false;
    });

    it('should initialize and cache health state', async () => {
      // Arrange - Mock services as healthy
      const originalResendApiKey = process.env.RESEND_API_KEY;
      const originalSmtpHost = process.env.SMTP_HOST;

      // Set environment variables
      process.env.RESEND_API_KEY = 'test-api-key';
      process.env.SMTP_HOST = 'test-smtp-host';
      process.env.AUTH_SECRET = 'test-secret';
      process.env.BASE_URL = 'test-url';

      mockStorageService.checkConnection.mockResolvedValue(true);
      mockStorageService.checkConfiguration.mockResolvedValue({
        name: 'Spaces Storage',
        configured: true,
        connected: true,
        configToReview: undefined,
        error: undefined,
      });

      mockAuthService.checkConfiguration.mockResolvedValue({
        name: 'Auth Service',
        configured: true,
        connected: true,
        error: undefined,
        configToReview: undefined,
      });

      try {
        // Act
        await StatusService.initialize();
        const healthState = StatusService.getHealthState(); // Assert
        expect(healthState).toBeDefined();
        expect(healthState?.services).toHaveLength(5); // Storage + Email + Database + Billing + Auth
        expect(healthState?.isHealthy).toBe(true);
        expect(StatusService.isApplicationHealthy()).toBe(true);
      } finally {
        // Cleanup environment variables
        if (originalResendApiKey !== undefined) {
          process.env.RESEND_API_KEY = originalResendApiKey;
        } else {
          delete process.env.RESEND_API_KEY;
        }
        if (originalSmtpHost !== undefined) {
          process.env.SMTP_HOST = originalSmtpHost;
        } else {
          delete process.env.SMTP_HOST;
        }
      }
    });

    it('should return cached state without re-checking', async () => {
      // Arrange - Mock services as healthy
      const originalResendApiKey = process.env.RESEND_API_KEY;
      const originalSmtpHost = process.env.SMTP_HOST;

      // Set environment variables for email service
      process.env.RESEND_API_KEY = 'test-api-key';
      process.env.SMTP_HOST = 'test-smtp-host';

      mockStorageService.checkConnection.mockResolvedValue(true);
      mockStorageService.checkConfiguration.mockResolvedValue({
        name: 'Spaces Storage',
        configured: true,
        connected: true,
        configToReview: undefined,
        error: undefined,
      });

      try {
        await StatusService.initialize();

        // Act
        const firstCall = StatusService.getHealthState();
        const secondCall = StatusService.getHealthState(); // Assert
        expect(firstCall).toBe(secondCall); // Same object reference
        expect(createStorageService).toHaveBeenCalledTimes(1);
      } finally {
        // Cleanup environment variables
        if (originalResendApiKey !== undefined) {
          process.env.RESEND_API_KEY = originalResendApiKey;
        } else {
          delete process.env.RESEND_API_KEY;
        }
        if (originalSmtpHost !== undefined) {
          process.env.SMTP_HOST = originalSmtpHost;
        } else {
          delete process.env.SMTP_HOST;
        }
      }
    });

    it('should force fresh check when requested', async () => {
      // Arrange - Mock services as healthy
      const originalResendApiKey = process.env.RESEND_API_KEY;
      const originalSmtpHost = process.env.SMTP_HOST;

      // Set environment variables for email service
      process.env.RESEND_API_KEY = 'test-api-key';
      process.env.SMTP_HOST = 'test-smtp-host';

      mockStorageService.checkConnection.mockResolvedValue(true);
      mockStorageService.checkConfiguration.mockResolvedValue({
        name: 'Spaces Storage',
        configured: true,
        connected: true,
        configToReview: undefined,
        error: undefined,
      });

      try {
        await StatusService.initialize();

        // Act
        const cachedState = StatusService.getHealthState();
        const freshState = await StatusService.forceHealthCheck(); // Assert
        expect(freshState).not.toBe(cachedState); // Different object reference
        expect(createStorageService).toHaveBeenCalledTimes(2);
      } finally {
        // Cleanup environment variables
        if (originalResendApiKey !== undefined) {
          process.env.RESEND_API_KEY = originalResendApiKey;
        } else {
          delete process.env.RESEND_API_KEY;
        }
        if (originalSmtpHost !== undefined) {
          process.env.SMTP_HOST = originalSmtpHost;
        } else {
          delete process.env.SMTP_HOST;
        }
      }
    });
    it('should report unhealthy when services have issues', async () => {
      // Arrange - make a required service (email) unhealthy
      mockEmailService.checkConfiguration.mockResolvedValue({
        name: 'Email Service',
        configured: false,
        connected: false,
        error: 'SMTP configuration missing',
        configToReview: ['SMTP_HOST', 'SMTP_PORT'],
      });

      // Act
      await StatusService.initialize();

      // Assert
      expect(StatusService.isApplicationHealthy()).toBe(false);
      const healthState = StatusService.getHealthState();
      expect(healthState?.isHealthy).toBe(false);
    });
  });
});
