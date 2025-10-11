import { withAuth } from 'lib/auth/withAuth';
import { getNote } from './getNote';
import { editNote } from './editNote';
import { deleteNote } from './deleteNote';

/**
 * Handles GET requests to fetch a note by its ID.
 * This route is protected and requires authentication.
 */
export const GET = withAuth(getNote);

/**
 * Handles PUT requests to edit a note.
 * This route is protected and requires authentication.
 */
export const PUT = withAuth(editNote);

/**
 * Handles DELETE requests to delete a note by its ID.
 * This route is protected and requires authentication.
 */
export const DELETE = withAuth(deleteNote);
