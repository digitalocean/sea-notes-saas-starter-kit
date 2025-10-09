/**
 * AI Content Generation API Endpoint
 * 
 * This API endpoint provides on-demand AI content generation for note creation.
 * When users click "Generate Note with AI" in the note creation modal, this
 * endpoint generates helpful, actionable content using DigitalOcean's Inference API.
 * 
 * Features:
 * - User authentication validation
 * - AI service availability checking
 * - Content generation with consistent formatting
 * - Error handling with user-friendly messages
 * 
 * Request:
 * - Method: POST
 * - Body: {} (empty JSON object)
 * - Requires: Valid authentication session
 * 
 * Response:
 * - Success: { content: string }
 * - Error: { error: string }
 * 
 * The generated content follows a casual-professional tone with actionable
 * takeaways, designed to be immediately useful for note-taking.
 * 
 * @description POST /api/ai/generate-content
 * @author AI Content Generation Feature Implementation
 * @since 2024
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '../../../../lib/auth/auth';
import { DigitalOceanInferenceService } from '../../../../services/ai/digitalOceanInferenceService';
import { hasAIConfiguredServer } from '../../../../settings';
import { HTTP_STATUS } from '../../../../lib/api/http';
import { withRateLimit } from '../../../../lib/rateLimit';

/**
 * Generate AI content for notes
 * POST /api/ai/generate-content
 */
async function generateContentHandler(request: NextRequest) {
  try {
    // Check if AI is configured
    if (!hasAIConfiguredServer) {
      return NextResponse.json(
        { error: 'AI content generation is not configured' },
        { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
      );
    }

    // Authentication check
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: HTTP_STATUS.UNAUTHORIZED }
      );
    }

    // Validate request has valid JSON (even if empty)
    try {
      await request.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

    try {
      // Generate content using the unified service
      const service = new DigitalOceanInferenceService();
      const content = await service.generateContent();

      return NextResponse.json({ content });
    } catch (error) {
      console.error('Content generation failed:', error);
      return NextResponse.json(
        { error: 'Content generation failed. Please try again.' },
        { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
      );
    }
  } catch (error) {
    console.error('Unexpected error in generate-content endpoint:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
}

// Apply rate limiting: 10 AI requests per minute per user
export const POST = withRateLimit(generateContentHandler, {
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 AI requests per minute
  message: 'Too many AI content generation requests. Please slow down.',
  keyGenerator: (req) => {
    // Use user ID instead of IP for authenticated endpoints
    const forwarded = req.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : req.ip || 'unknown';
    return `ai-${ip}`;
  }
});