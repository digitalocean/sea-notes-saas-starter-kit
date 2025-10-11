import { HTTP_STATUS } from 'lib/api/http';
import { NextRequest, NextResponse } from 'next/server';
import { createDatabaseService } from 'services/database/databaseFactory';

/**
 * Handles the editing of a note.
 * @param request - The Next.js request object containing the note data.
 * @param user - The user object containing the user's ID and role.
 * @param params - A promise that resolves to an object containing the note ID.
 * @returns A NextResponse object containing the updated note or an error message.
 */
export const editNote = async (
  request: NextRequest,
  user: { id: string; role: string },
  params: Promise<{ id: string }>
): Promise<NextResponse> => {
  try {
    const { id: noteId } = await params;
    const userId = user.id;
    const { title, content } = await request.json();
    const dbClient = await createDatabaseService();

    if (!title && !content) {
      return NextResponse.json(
        { error: 'At least one field (title or content) is required' },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

    const existingNote = await dbClient.note.findById(noteId);

    if (!existingNote) {
      return NextResponse.json({ error: 'Note not found' }, { status: HTTP_STATUS.NOT_FOUND });
    }

    if (existingNote.userId !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: HTTP_STATUS.FORBIDDEN });
    }

    const updatedNote = await dbClient.note.update(noteId, {
      title,
      content,
    });

    return NextResponse.json(updatedNote, { status: HTTP_STATUS.OK });
  } catch (error) {
    console.error('Error updating note:', error);
    return NextResponse.json(
      { error: 'Failed to update note' },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
};
