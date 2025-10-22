// Service factory imports
import { createStorageService } from '../storage/storageFactory';
import { createEmailService } from '../email/emailFactory';
import { createDatabaseService } from '../database/databaseFactory';
import { ServiceStatus } from './serviceConfigStatus';
import { createBillingService } from 'services/billing/billingFactory';
import { createAuthService } from 'services/auth/authFactory';
import { createInvoiceService } from 'services/invoice/invoiceFactory';

/**
 * Interface for application health state
 * Represents the overall health of the application and all its services
 */
export interface HealthState {
  isHealthy: boolean;
  lastChecked: Date;
  services: ServiceStatus[];
}

/**
 * Service for checking configuration and connectivity status of various services
 * Now includes built-in health state caching for optimal performance
 * 
 * This service is responsible for monitoring the health of all external services
 * that the application depends on, such as database, email, storage, etc.
 */
export class StatusService {
  private static cachedHealthState: HealthState | null = null;
  private static isInitialized = false;

  /**
   * Initialize health checking at application startup
   * This should be called once during app initialization
   * Sets up the initial health state and logs the results
   */
  static async initialize(): Promise<void> {
    // Don't initialize multiple times
    if (this.isInitialized) {
      return;
    }

    console.log('🔍 Initializing application health checks...');

    try {
      // Perform the initial health check
      await this.performHealthCheck();
      this.isInitialized = true;

      // Log the results
      if (this.cachedHealthState?.isHealthy) {
        console.log('✅ All services are healthy');
      } else {
        console.log('⚠️ Some services have issues');
      }
    } catch (error) {
      // Handle initialization errors
      console.error('❌ Failed to initialize health checks:', error);
      // Set unhealthy state as fallback
      this.cachedHealthState = {
        isHealthy: false,
        lastChecked: new Date(),
        services: [],
      };
      this.isInitialized = true;
    }
  }

  /**
   * Check if the application is healthy (all services are working)
   * This is a fast, cached check suitable for middleware use
   * 
   * @returns True if the application is healthy, false otherwise
   */
  static isApplicationHealthy(): boolean {
    if (!this.cachedHealthState) {
      // If not initialized, assume unhealthy for safety
      return false;
    }
    return this.cachedHealthState.isHealthy;
  }

  /**
   * Get the current health state for detailed reporting
   * 
   * @returns The current health state or null if not initialized
   */
  static getHealthState(): HealthState | null {
    return this.cachedHealthState;
  }

  /**
   * Force a fresh health check (bypasses cache)
   * Use this for the system status page refresh button
   * 
   * @returns The updated health state
   */
  static async forceHealthCheck(): Promise<HealthState> {
    await this.performHealthCheck();
    return this.cachedHealthState!;
  }

  /**
   * Performs the actual health check and updates the cached state
   * This is the core method that checks all services and determines overall health
   */
  private static async performHealthCheck(): Promise<void> {
    try {
      // Check the status of all services
      const serviceStatuses = await this.checkAllServices();

      // Determine if the application is healthy
      // Only required services matter for overall health
      const requiredServices = serviceStatuses.filter((service) => service.required);
      const isHealthy = requiredServices.every(
        (service) => service.configured && service.connected
      );

      // Update the cached health state
      this.cachedHealthState = {
        isHealthy,
        lastChecked: new Date(),
        services: serviceStatuses,
      };
    } catch (error) {
      // Handle errors during health check
      console.error('Failed to perform health check:', error);

      // Set unhealthy state on error
      this.cachedHealthState = {
        isHealthy: false,
        lastChecked: new Date(),
        services: [
          {
            name: 'Health Check System',
            configured: false,
            connected: false,
            required: true, // Health check system itself is required
            error: `Health check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          },
        ],
      };
    }
  }

  /**
   * Checks the status of storage service configuration and connectivity
   * Uses the StorageService interface to check the current storage provider
   *
   * @returns The status of the storage service
   */
  static async checkStorageStatus(): Promise<ServiceStatus> {
    try {
      // Get the storage service instance
      const storageService = await createStorageService();

      // Get configuration status from the service and add required classification
      const configStatus = await storageService.checkConfiguration();
      return {
        ...configStatus,
        required: storageService.isRequired(),
      };
    } catch (error) {
      // Handle storage service initialization errors
      return {
        name: 'Storage Service',
        configured: false,
        connected: false,
        required: false, // Default to false if service can't be initialized
        error:
          error instanceof Error
            ? `Failed to initialize storage service: ${error.message}`
            : 'Failed to initialize storage service: Unknown error',
      };
    }
  }

  /**
   * Checks the configuration and connectivity status of the email service
   * Uses the EmailService interface to check the current email provider
   *
   * @returns The status of the email service
   */
  static async checkEmailStatus(): Promise<ServiceStatus> {
    try {
      // Get the email service instance
      const emailService = await createEmailService();

      // Get configuration status from the service and add required classification
      const configStatus = await emailService.checkConfiguration();
      return {
        ...configStatus,
        required: emailService.isRequired(),
      };
    } catch (error) {
      // Handle email service initialization errors
      return {
        name: 'Email Service',
        configured: false,
        connected: false,
        required: true, // Default to true since email is critical
        error:
          error instanceof Error
            ? `Failed to initialize email service: ${error.message}`
            : 'Failed to initialize email service: Unknown error',
      };
    }
  }

  /**
   * Checks the configuration and connectivity status of the database service
   * Uses the DatabaseClient interface to check the current database provider
   *
   * @returns The status of the database service
   */
  static async checkDatabaseStatus(): Promise<ServiceStatus> {
    try {
      // Get the database service instance
      const databaseService = await createDatabaseService();

      // Get configuration status from the service and add required classification
      const configStatus = await databaseService.checkConfiguration();
      return {
        ...configStatus,
        required: databaseService.isRequired(),
      };
    } catch (error) {
      // Handle database service initialization errors
      return {
        name: 'Database Service',
        configured: false,
        connected: false,
        required: true, // Default to true since database is critical
        error:
          error instanceof Error
            ? `Failed to initialize database service: ${error.message}`
            : 'Failed to initialize database service: Unknown error',
      };
    }
  }

  /**
   * Checks the configuration and connectivity status of the billing service
   * Uses the BillingService interface to check the current billing provider
   *
   * @returns The status of the billing service
   */
  static async checkBillingStatus(): Promise<ServiceStatus> {
    try {
      // Get the billing service instance
      const billingService = await createBillingService();

      // Get configuration status from the service and add required classification
      const configStatus = await billingService.checkConfiguration();
      return {
        ...configStatus,
        required: billingService.isRequired(),
      };
    } catch (error) {
      // Handle billing service initialization errors
      return {
        name: 'Billing Service',
        configured: false,
        connected: false,
        required: true,
        error:
          error instanceof Error
            ? `Failed to initialize billing service: ${error.message}`
            : 'Failed to initialize billing service: Unknown error',
      };
    }
  }

  /**
   * Checks the configuration and connectivity status of the auth service
   * Uses the AuthService interface to check the current auth provider
   *
   * @returns The status of the auth service
   */
  static async checkAuthStatus(): Promise<ServiceStatus> {
    try {
      // Get the auth service instance
      const authService = await createAuthService();

      // Get configuration status from the service and add required classification
      const configStatus = await authService.checkConfiguration();
      return {
        ...configStatus,
        required: authService.isRequired(),
      };
    } catch (error) {
      // Handle auth service initialization errors
      return {
        name: 'Auth Service',
        configured: false,
        connected: false,
        required: false,
        error:
          error instanceof Error
            ? `Failed to initialize billing service: ${error.message}`
            : 'Failed to initialize billing service: Unknown error',
      };
    }
  }

  /**
   * Checks the configuration and connectivity status of the invoice service
   * Uses the InvoiceService interface to check the current invoice provider
   *
   * @returns The status of the invoice service
   */
  static async checkInvoiceStatus(): Promise<ServiceStatus> {
    try {
      // Get the invoice service instance
      const invoiceService = await createInvoiceService();

      // Get configuration status from the service and add required classification
      const configStatus = await invoiceService.checkConfiguration();
      return {
        ...configStatus,
        required: invoiceService.isRequired(),
      };
    } catch (error) {
      // Handle invoice service initialization errors
      return {
        name: 'Invoice Service',
        configured: false,
        connected: false,
        required: false, // Invoice service is optional
        error:
          error instanceof Error
            ? `Failed to initialize invoice service: ${error.message}`
            : 'Failed to initialize invoice service: Unknown error',
      };
    }
  }

  /**
   * Checks the status of all configured services
   * This method will automatically check all available services
   *
   * @returns The status of all services
   */
  static async checkAllServices(): Promise<ServiceStatus[]> {
    const services: ServiceStatus[] = [];

    // Check storage service
    const storageStatus = await this.checkStorageStatus();
    services.push(storageStatus);

    // Check email service (demonstrates extensibility)
    const emailStatus = await this.checkEmailStatus();
    services.push(emailStatus);

    // Check database service (demonstrates extensibility)
    const databaseStatus = await this.checkDatabaseStatus();
    services.push(databaseStatus);

    // Check billing service
    const billingStatus = await this.checkBillingStatus();
    services.push(billingStatus);

    // Check auth service
    const authStatus = await this.checkAuthStatus();
    services.push(authStatus);

    // Check invoice service
    const invoiceStatus = await this.checkInvoiceStatus();
    services.push(invoiceStatus);

    return services;
  }
}