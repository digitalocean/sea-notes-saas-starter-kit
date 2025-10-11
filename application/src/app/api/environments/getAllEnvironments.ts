import { HTTP_STATUS } from 'lib/api/http';
import { NextRequest, NextResponse } from 'next/server';
import { createDatabaseService } from 'services/database/databaseFactory';

/**
 * Fetches all environments for the authenticated user.
 * @param request - The request object with pagination
 * @param user - The user object
 * @returns A NextResponse with properly typed environment data
 */
export const getAllEnvironments = async (
  request: NextRequest,
  user: { id: string; role: string }
): Promise<NextResponse> => {
  try {
    const userId = user.id;
    const dbClient = await createDatabaseService(); // Parse pagination params
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '10', 10);
    const searchParam = searchParams.get('search')?.trim();
    const search = searchParam && searchParam.length > 0 ? searchParam : undefined;
    const sortBy = searchParams.get('sortBy') || 'newest'; // Build findMany parameters conditionally
    const skip = page === 1 ? 0 : (page - 1) * pageSize;
    const findManyParams: {
      userId: string;
      skip: number;
      take: number;
      search?: string;
      orderBy: { name: 'asc' } | { createdAt: 'asc' | 'desc' }; // Changed from title
    } = {
      userId,
      skip,
      take: pageSize,
      orderBy:
        sortBy === 'name' // Changed from title
          ? { name: 'asc' as const } // Changed from title
          : sortBy === 'oldest'
            ? { createdAt: 'asc' as const }
            : { createdAt: 'desc' as const },
    };

    // Only include search if it's defined
    if (search !== undefined) {
      findManyParams.search = search;
    }

    // Get all environments for the user
    const [environments, total] = await Promise.all([
      dbClient.environment.findMany(findManyParams),
      dbClient.environment.count(userId, search),
    ]);

    // Return both environments and total count
    return NextResponse.json({ environments, total }, { status: HTTP_STATUS.OK });
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch environments' },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
};
