// Import auth middleware and note handlers
import { withAuth } from 'lib/auth/withAuth';
import { getAllNotes } from './getAllNotes';
import { createNote } from './createNote';

/**
 * GET endpoint for retrieving all notes for the authenticated user
 * Requires authentication but no specific role
 */
export const GET = withAuth(getAllNotes);

/**
 * POST endpoint for creating a new note
 * Requires authentication but no specific role
 */
export const POST = withAuth(createNote);