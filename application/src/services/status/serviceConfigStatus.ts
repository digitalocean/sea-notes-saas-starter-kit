/**
 * Common interfaces for service configuration and status checking
 * These interfaces can be used by any service (storage, email, database, etc.)
 * to provide consistent status reporting across the application
 */

/**
 * Interface for service configuration status
 * Used to report the configuration and connection status of any service
 */
export interface ServiceConfigStatus {
  name: string; // Display name of the service
  configured: boolean; // true if there are no missing settings
  connected?: boolean; // true if connection to the service was successful
  configToReview?: string[]; // if there was a missing setting, add it here, if the connection failed add all the required settings here
  error?: string; // Configuration missing or Connection failed
  description?: string; // Service usage description
}

/**
 * Extended interface that includes criticality information for status service
 * Used by StatusService to determine overall application health
 */
export interface ServiceStatus extends ServiceConfigStatus {
  required: boolean; // true if this service is critical for app functionality
}

/**
 * Generic interface for services that can be checked for configuration and connectivity
 * Services implementing this interface should provide consistent status reporting
 */
export interface ConfigurableService {
  /**
   * Checks if the service is properly configured and accessible
   * @returns True if the connection is successful, false otherwise
   */
  checkConnection(): Promise<boolean>;

  /**
   * Checks if the service configuration is valid and tests connection when configuration is complete
   * @returns Configuration and connection status object
   */
  checkConfiguration(): Promise<ServiceConfigStatus>;

  /**
   * Indicates whether this service is required for the application to function properly
   * @returns True if the service is critical, false if it's optional
   */
  isRequired(): boolean;
}