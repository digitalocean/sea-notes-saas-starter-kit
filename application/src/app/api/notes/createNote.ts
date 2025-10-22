// HTTP and Next.js imports
import { HTTP_STATUS } from 'lib/api/http';
import { NextRequest, NextResponse } from 'next/server';
import { createDatabaseService } from 'services/database/databaseFactory';
import { generateTimestampTitle } from '../../../services/ai/digitalOceanInferenceService';
import { triggerBackgroundTitleGeneration } from '../../../services/ai/backgroundTitleService';
import { hasAIConfiguredServer } from '../../../settings';

/**
 * Create a new note for the authenticated user
 * If no title is provided, generates one automatically
 * If AI is configured, triggers background title generation
 * 
 * @param request - The request object containing note data
 * @param user - The authenticated user object
 * @returns The created note
 */
export async function createNote(
  request: NextRequest,
  user: { id: string; role: string }
): Promise<NextResponse> {
  try {
    // Get user ID from authenticated user
    const userId = user.id;
    
    // Parse note data from request body
    const { title, content } = await request.json();

    // Validate that content is provided
    if (!content) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

    // Use provided title or generate timestamp title for fast save
    const finalTitle = title || generateTimestampTitle();

    // Get database client
    const dbClient = await createDatabaseService();

    // Save note immediately with timestamp title
    const note = await dbClient.note.create({
      userId,
      title: finalTitle,
      content,
    });

    // Trigger background title generation if no title provided and AI configured
    if (!title && hasAIConfiguredServer) {
      triggerBackgroundTitleGeneration(note.id, content, userId);
    }

    // Return the created note
    return NextResponse.json(note, { status: HTTP_STATUS.CREATED });
  } catch (error) {
    // Log error and return generic error response
    console.error('Error creating note:', error);
    return NextResponse.json(
      { error: 'Failed to create note' },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
}