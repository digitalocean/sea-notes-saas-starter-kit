import { withAuth } from 'lib/auth/withAuth';
import { getAllEnvironments } from './getAllEnvironments';
import { createEnvironment } from './createEnvironment';

export const GET = withAuth(getAllEnvironments);

export const POST = withAuth(createEnvironment);
