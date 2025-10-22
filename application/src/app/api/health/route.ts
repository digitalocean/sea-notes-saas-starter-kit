// HTTP status codes import
import { HTTP_STATUS } from 'lib/api/http';
import { NextResponse } from 'next/server';

/**
 * Handles GET requests for the health endpoint
 * This is a simple endpoint to check if the API is running
 * Useful for monitoring and uptime checks
 * 
 * @returns JSON response with status 'ok' and 200 status code
 */
export function GET() {
  return NextResponse.json({ status: 'ok' }, { status: HTTP_STATUS.OK });
}