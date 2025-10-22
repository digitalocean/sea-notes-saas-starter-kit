// HTTP and Next.js imports
import { HTTP_STATUS } from 'lib/api/http';
import { NextRequest, NextResponse } from 'next/server';
import { createDatabaseService } from 'services/database/databaseFactory';

/**
 * Handles the retrieval of all users with optional pagination and filtering
 * This endpoint is only accessible to admin users
 *
 * @param request - The Next.js request object containing query parameters for pagination and filtering
 * @returns A NextResponse containing the list of users and the total count
 */
export async function getAllUsers(request: NextRequest): Promise<NextResponse> {
  try {
    // Get database client
    const dbClient = await createDatabaseService();

    // Parse query parameters
    const { searchParams } = new URL(request.url);

    // Get pagination parameters with defaults
    let page = parseInt(searchParams.get('page') || '1', 10);
    if (isNaN(page) || page < 1) page = 1;

    let pageSize = parseInt(searchParams.get('pageSize') || '10', 10);
    if (isNaN(pageSize) || pageSize < 1) pageSize = 10;

    // Get filter parameters
    const searchName = searchParams.get('searchName') || undefined;
    const filterPlan = searchParams.get('filterPlan') || undefined;
    const filterStatus = searchParams.get('filterStatus') || undefined;

    // Get users from database
    const { users, total } = await dbClient.user.findAll({
      page,
      pageSize,
      searchName,
      filterPlan,
      filterStatus,
    });
    
    // Return users and total count
    return NextResponse.json({ users, total });
  } catch (error) {
    // Log error and return generic error response
    console.error('Server error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
}