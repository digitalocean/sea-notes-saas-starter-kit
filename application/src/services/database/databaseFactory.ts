import { DatabaseClient } from './database';
import { serverConfig } from '../../settings';

// Database provider types
export type DatabaseProvider = 'Postgres';

/**
 * Factory function to create and return the appropriate database client based on the configured provider.
 * Uses dynamic imports to avoid circular dependencies.
 */
export async function createDatabaseService(): Promise<DatabaseClient> {
  const databaseProvider = serverConfig.databaseProvider;

  switch (databaseProvider) {
    case 'Postgres':
    default: {
      const { SqlDatabaseService } = await import('./sqlDatabaseService');
      return new SqlDatabaseService();
    }
    // Add more providers here in the future
    // case 'MySQL': {
    //   const { MySqlDatabaseService } = await import('./mysqlDatabaseService');
    //   return new MySqlDatabaseService();
    // }
  }
}
