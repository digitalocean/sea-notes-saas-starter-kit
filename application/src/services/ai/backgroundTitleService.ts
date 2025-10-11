/**
 * Background AI Name Generation Service
 * 
 * Handles asynchronous AI name generation for environments without blocking environment creation.
 * Updates names in background and notifies frontend via SSE.
 */

import { generateNameWithFallback } from './digitalOceanInferenceService';
import { createDatabaseService } from '../database/databaseFactory';
import { hasAIConfiguredServer } from '../../settings';
import { broadcastNameUpdate } from '../sse/eventManager';

/**
 * Background service for generating and updating environment names
 */
export class BackgroundNameService {
  /**
   * Generate name for an environment in the background and update it
   * @param environmentId - The ID of the environment to update
   * @param content - The content to generate name from
   * @param userId - The ID of the user who owns the environment
   */
  static async generateNameInBackground(environmentId: string, content: string, userId: string): Promise<void> {
    // Only proceed if AI is configured
    if (!hasAIConfiguredServer) {
      return;
    }

    try {
      // Generate name using AI with fallback
      const generatedName = await generateNameWithFallback(content);
      
      // Update the environment with the generated name
      const dbClient = await createDatabaseService();
      await dbClient.environment.update(environmentId, {
        name: generatedName,
      });
      
      // Broadcast SSE event to notify the frontend
      broadcastNameUpdate(environmentId, generatedName, userId);
    } catch (error) {
      console.error(`Failed to generate name for environment ${environmentId}:`, error);
      // Note: We don't throw here because background processing should be non-blocking
      // The environment will keep its timestamp name if AI generation fails
    }
  }

  /**
   * Queue name generation for an environment (fire-and-forget)
   * @param environmentId - The ID of the environment to update
   * @param content - The content to generate name from
   * @param userId - The ID of the user who owns the environment
   */
  static queueNameGeneration(environmentId: string, content: string, userId: string): void {
    // Fire-and-forget: don't await this
    this.generateNameInBackground(environmentId, content, userId).catch((error) => {
      console.error(`Background name generation failed for environment ${environmentId}:`, error);
    });
  }
}

/**
 * Convenience function to trigger background name generation
 * @param environmentId - The ID of the environment to update  
 * @param content - The content to generate name from
 * @param userId - The ID of the user who owns the environment
 */
export function triggerBackgroundNameGeneration(environmentId: string, content: string, userId: string): void {
  BackgroundNameService.queueNameGeneration(environmentId, content, userId);
}