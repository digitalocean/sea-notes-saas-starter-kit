/**
 * Server-Sent Events (SSE) API Endpoint for Real-time Notes Updates
 * 
 * This endpoint establishes and maintains Server-Sent Event connections for
 * real-time communication between the server and client. It's primarily used
 * to deliver live updates about note changes, especially AI-generated title
 * updates that happen in the background.
 * 
 * Functionality:
 * - Establishes persistent SSE connection with authenticated users
 * - Registers connection in the global event manager
 * - Streams real-time events (title updates, note changes, etc.)
 * - Handles connection cleanup on client disconnect
 * - Maintains security with user authentication
 * 
 * Use Cases:
 * - AI title generation: When background service generates a title,
 *   this endpoint delivers the update immediately to the user's browser
 * - Note synchronization across multiple tabs/devices
 * - Live collaboration features
 * - System notifications and updates
 * 
 * Technical Details:
 * - Uses standard SSE protocol (text/event-stream)
 * - Requires authentication for security
 * - Maintains connection until client disconnects
 * - Integrates with eventManager for message broadcasting
 * 
 * Client Usage:
 * - Frontend connects via EventSource('/api/notes/events')
 * - Receives events like 'title-update' with note data
 * - Automatically updates UI without page refresh
 * 
 * @description GET /api/notes/events - SSE endpoint for real-time updates
 * @author Real-time Features Implementation
 * @since 2024
 */

import { NextRequest } from 'next/server';
import { auth } from 'lib/auth/auth';

/**
 * SSE endpoint for real-time notes events
 * Streams title update events to connected clients
 */
export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const session = await auth();
    if (!session?.user?.id) {
      return new Response('Unauthorized', { status: 401 });
    }

    const userId = session.user.id;

    // Determine allowed origin for CORS (security: don't use wildcard)
    const allowedOrigins = [
      process.env.BASE_URL,
      'http://localhost:3000', // Development fallback
      'https://localhost:3000'  // HTTPS development
    ].filter(Boolean);

    // Ensure allowedOrigins is not empty
    if (allowedOrigins.length === 0) {
      return new Response('CORS error: No allowed origins configured', { status: 400 });
    }
    const origin = request.headers.get('origin');
    const corsOrigin = origin && allowedOrigins.includes(origin) ? origin : allowedOrigins[0] as string;

    // Create SSE response headers
    const headers = new Headers({
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': corsOrigin,
      'Access-Control-Allow-Headers': 'Cache-Control'
    });

    // Create readable stream for SSE
    const stream = new ReadableStream({
      start(controller) {
        // Send initial connection event
        const initialEvent = `data: ${JSON.stringify({
          type: 'connected',
          message: 'SSE connection established',
          timestamp: Date.now()
        })}\n\n`;
        
        controller.enqueue(new TextEncoder().encode(initialEvent));

        // Store this connection for broadcasting
        global.sseConnections = global.sseConnections || new Map();
        global.sseConnections.set(userId, controller);

        // Send keepalive ping every 30 seconds
        const pingInterval = setInterval(() => {
          try {
            const pingEvent = `data: ${JSON.stringify({
              type: 'ping',
              timestamp: Date.now()
            })}\n\n`;
            
            controller.enqueue(new TextEncoder().encode(pingEvent));
          } catch {
            clearInterval(pingInterval);
          }
        }, 30000);

        // Cleanup on disconnect
        request.signal.addEventListener('abort', () => {
          clearInterval(pingInterval);
          global.sseConnections?.delete(userId);
          try {
            controller.close();
          } catch {
            // Connection already closed
          }
        });
      }
    });

    return new Response(stream, { headers });
  } catch (error) {
    console.error('SSE endpoint error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}

