// HTTP and Next.js imports
import { HTTP_STATUS } from 'lib/api/http';
import { NextRequest, NextResponse } from 'next/server';
import { createDatabaseService } from 'services/database/databaseFactory';

/**
 * Fetches all notes for the authenticated user
 * Supports pagination, search, and sorting
 * 
 * @param request - The request object with pagination parameters
 * @param user - The authenticated user object
 * @returns A NextResponse with properly typed note data
 */
export async function getAllNotes(
  request: NextRequest,
  user: { id: string; role: string }
): Promise<NextResponse> {
  try {
    // Get the user ID from the authenticated user
    const userId = user.id;
    
    // Get database client
    const dbClient = await createDatabaseService();
    
    // Parse pagination params from URL
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '10', 10);
    const searchParam = searchParams.get('search')?.trim();
    const search = searchParam && searchParam.length > 0 ? searchParam : undefined;
    const sortBy = searchParams.get('sortBy') || 'newest';
    
    // Calculate skip value for pagination
    const skip = page === 1 ? 0 : (page - 1) * pageSize;
    
    // Build findMany parameters conditionally
    const findManyParams: {
      userId: string;
      skip: number;
      take: number;
      search?: string;
      orderBy: { title: 'asc' } | { createdAt: 'asc' | 'desc' };
    } = {
      userId,
      skip,
      take: pageSize,
      orderBy:
        sortBy === 'title'
          ? { title: 'asc' as const }
          : sortBy === 'oldest'
            ? { createdAt: 'asc' as const }
            : { createdAt: 'desc' as const },
    };

    // Only include search if it's defined
    if (search !== undefined) {
      findManyParams.search = search;
    }

    // Get all notes for the user in parallel for better performance
    const [notes, total] = await Promise.all([
      dbClient.note.findMany(findManyParams),
      dbClient.note.count(userId, search),
    ]);

    // Return both notes and total count
    return NextResponse.json({ notes, total }, { status: HTTP_STATUS.OK });
  } catch {
    // Return error response if something goes wrong
    return NextResponse.json(
      { error: 'Failed to fetch notes' },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
}