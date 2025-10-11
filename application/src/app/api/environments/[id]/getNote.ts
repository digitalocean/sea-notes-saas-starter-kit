import { HTTP_STATUS } from 'lib/api/http';
import { NextRequest, NextResponse } from 'next/server';
import { createDatabaseService } from 'services/database/databaseFactory';

/**
 * Fetches a note by its ID for the authenticated user.
 * @param request - The Next.js request object.
 * @param user - The authenticated user object containing id and role.
 * @param params - The parameters from the request, including the note ID.
 * @returns A NextResponse with the note data or an error message.
 */
export const getNote = async (
  request: NextRequest,
  user: { id: string; role: string },
  params: Promise<{ id: string }>
): Promise<NextResponse> => {
  try {
    const { id: noteId } = await params;
    const userId = user.id;
    const dbClient = await createDatabaseService();

    const note = await dbClient.note.findById(noteId);

    if (!note) {
      return NextResponse.json({ error: 'Note not found' }, { status: HTTP_STATUS.NOT_FOUND });
    }

    if (note.userId !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: HTTP_STATUS.FORBIDDEN });
    }

    return NextResponse.json(note, { status: HTTP_STATUS.OK });
  } catch (error) {
    console.error('Error fetching note:', error);
    return NextResponse.json(
      { error: 'Failed to fetch note' },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
};
