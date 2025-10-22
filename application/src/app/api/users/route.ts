// Import auth middleware and user handlers
import { withAuth } from 'lib/auth/withAuth';
import { getAllUsers } from './getAllUsers';
import { USER_ROLES } from '../../../lib/auth/roles';

/**
 * GET endpoint for retrieving users
 * Only accessible to admin users
 */
export const GET = withAuth(getAllUsers, { allowedRoles: [USER_ROLES.ADMIN] });