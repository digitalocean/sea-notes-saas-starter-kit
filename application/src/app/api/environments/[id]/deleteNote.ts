import { HTTP_STATUS } from 'lib/api/http';
import { NextRequest, NextResponse } from 'next/server';
import { createDatabaseService } from 'services/database/databaseFactory';

/**
 * Deletes a note by its ID.
 * @param request - The Next.js request object.
 * @param user - The authenticated user object containing user ID and role.
 * @param params - Promise resolving to the parameters, including the note ID.
 * @returns A NextResponse indicating success or failure.
 */
export const deleteNote = async (
  request: NextRequest,
  user: { id: string; role: string },
  params: Promise<{ id: string }>
): Promise<NextResponse> => {
  try {
    const { id: noteId } = await params;
    const userId = user.id;
    const dbClient = await createDatabaseService();

    const existingNote = await dbClient.note.findById(noteId);

    if (!existingNote) {
      return NextResponse.json({ error: 'Note not found' }, { status: HTTP_STATUS.NOT_FOUND });
    }

    if (existingNote.userId !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: HTTP_STATUS.FORBIDDEN });
    }

    await dbClient.note.delete(noteId);

    return NextResponse.json({ success: true }, { status: HTTP_STATUS.OK });
  } catch (error) {
    console.error('Error deleting note:', error);
    return NextResponse.json(
      { error: 'Failed to delete note' },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
};
