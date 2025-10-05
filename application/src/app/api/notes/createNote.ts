import { HTTP_STATUS } from 'lib/api/http';
import { NextRequest, NextResponse } from 'next/server';
import { createDatabaseService } from 'services/database/databaseFactory';
import { generateTimestampTitle } from 'services/ai/digitalOceanInferenceService';
import { triggerBackgroundTitleGeneration } from 'services/ai/backgroundTitleService';
import { hasAIConfiguredServer } from 'settings';
import { NoteIntelligenceService } from 'services/notes/noteIntelligenceService';

/**
 * Create a new note
 * @param request - The request object
 * @param user - The user object
 * @returns The created note
 */
export const createNote = async (
  request: NextRequest,
  user: { id: string; role: string }
): Promise<NextResponse> => {
  try {
    const userId = user.id;
    const { title, content } = await request.json();

    if (!content) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

    // Use provided title or generate timestamp title for fast save
    const finalTitle = title || generateTimestampTitle();

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

    // Fire-and-forget embedding synchronization so creation is not blocked by AI latency
    if (hasAIConfiguredServer) {
      void NoteIntelligenceService.syncNoteEmbeddings({
        id: note.id,
        userId,
        content,
      }).catch(error => {
        console.error('Failed to sync embeddings for new note', note.id, error);
      });
    }

    return NextResponse.json(note, { status: HTTP_STATUS.CREATED });
  } catch (error) {
    console.error('Error creating note:', error);
    return NextResponse.json(
      { error: 'Failed to create note' },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
};
