import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from 'lib/auth/withAuth';
import { NotesQAService } from 'services/ai/notesQAService';
import { ErrorResponse, HTTP_STATUS } from 'lib/api/http';

const handler = async (req: NextRequest, user: { id: string }) => {
  try {
    const body = await req.json();
    const { question } = body || {};
    if (!question || typeof question !== 'string') {
      const err: ErrorResponse = { error: 'Question is required' };
      return NextResponse.json(err, { status: HTTP_STATUS.BAD_REQUEST });
    }

    const service = new NotesQAService();
    const answer = await service.answerQueryWithNotes(user.id, question);
    return NextResponse.json({ answer });
  } catch (error: unknown) {
    console.error('Notes QA error:', error);
    const err: ErrorResponse = { error: 'Failed to answer question' };
    return NextResponse.json(err, { status: HTTP_STATUS.INTERNAL_SERVER_ERROR });
  }
};

export const POST = withAuth(handler);
