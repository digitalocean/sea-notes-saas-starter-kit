import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from 'lib/auth/withAuth';
import { HTTP_STATUS } from 'lib/api/http';
import { NoteIntelligenceService } from 'services/notes/noteIntelligenceService';

const handlePost = async (
  request: NextRequest,
  user: { id: string; role: string }
): Promise<NextResponse> => {
  try {
    const body = await request.json().catch(() => ({}));
    const question = typeof body?.question === 'string' ? body.question : '';

    if (!question.trim()) {
      return NextResponse.json(
        { error: 'Question is required' },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

    const result = await NoteIntelligenceService.answerQuestion(user.id, question);

    return NextResponse.json(result, { status: HTTP_STATUS.OK });
  } catch (error) {
    console.error('Failed to answer notes question:', error);

    if (error instanceof Error && error.message.includes('not configured')) {
      return NextResponse.json(
        { error: error.message },
        { status: HTTP_STATUS.SERVICE_UNAVAILABLE }
      );
    }

    return NextResponse.json(
      { error: 'Failed to process question. Please try again later.' },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
};

export const POST = withAuth(handlePost);
