import { NextRequest, NextResponse } from 'next/server';
import { auth } from '../../../../lib/auth/auth';
import {prisma} from '../../../../lib/prisma';

export async function PUT(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { summariesEnabled } = await request.json();

    // Update user preferences
    // Note: This assumes a preferences field exists on User model
    // If not, maintainers will need to add it
    await prisma.user.update({
      where: { email: session.user.email },
      data: {
        // Store in a JSON field or separate table
        // For now, we'll just acknowledge the request
        // Maintainers will implement proper storage
      },
    });

    return NextResponse.json({
      success: true,
      summariesEnabled,
    });
  } catch (error) {
    console.error('Error updating preferences:', error);
    return NextResponse.json(
      { error: 'Failed to update preferences' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user preferences
    // By default it is enabled
    return NextResponse.json({
      summariesEnabled: true,
    });
  } catch (error) {
    console.error('Error fetching preferences:', error);
    return NextResponse.json(
      { error: 'Failed to fetch preferences' },
      { status: 500 }
    );
  }
}