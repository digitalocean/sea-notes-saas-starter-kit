import { NextRequest, NextResponse } from 'next/server';
import { auth } from '../../../../lib/auth/auth';
import { hasAIConfiguredServer } from '../../../../settings';
import { HTTP_STATUS } from '../../../../lib/api/http';
import { DigitalOceanInferenceService, generateTitleWithFallback } from '../../../../services/ai/digitalOceanInferenceService';

/**
 * POST /api/ai/generate-summary
 * Body: { content: string }
 * Response: { summary: string, title?: string }
 */
export async function POST(request: NextRequest) {
  try {
    if (!hasAIConfiguredServer) {
      return NextResponse.json({ error: 'AI is not configured' }, { status: HTTP_STATUS.INTERNAL_SERVER_ERROR });
    }

    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: HTTP_STATUS.UNAUTHORIZED });
    }

    let body: { content?: string };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: HTTP_STATUS.BAD_REQUEST });
    }

    const content = body?.content || '';
    if (!content || content.trim().length === 0) {
      return NextResponse.json({ error: 'Content is required' }, { status: HTTP_STATUS.BAD_REQUEST });
    }

    try {
      const service = new DigitalOceanInferenceService();
      const [summary, title] = await Promise.all([
        service.generateSummary(content),
        // generateTitleWithFallback will return timestamp fallback if AI fails
        generateTitleWithFallback(content),
      ]);

      return NextResponse.json({ summary, title });
    } catch (error) {
      console.error('AI summary generation failed:', error);
      return NextResponse.json({ error: 'AI generation failed' }, { status: HTTP_STATUS.INTERNAL_SERVER_ERROR });
    }
  } catch (error) {
    console.error('Unexpected error in generate-summary endpoint:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: HTTP_STATUS.INTERNAL_SERVER_ERROR });
  }
}
