import { StorageService } from './storage';
import { serverConfig } from '../../settings';

// Storage provider types
export type StorageProvider = 'Spaces';

/**
 * Factory function to create and return the appropriate storage service based on configuration.
 * Uses dynamic imports to avoid circular dependencies.
 */
export async function createStorageService(): Promise<StorageService> {
  const storageProvider = serverConfig.storageProvider;

  switch (storageProvider) {
    case 'Spaces':
    default: {
      const { SpacesStorageService } = await import('./spacesStorageService');
      return new SpacesStorageService();
    }
    // Add more providers here in the future
    // case 'AZURE': {
    //   const { AzureStorageService } = await import('./AzureStorageService');
    //   return new AzureStorageService();
    // }
  }
}
