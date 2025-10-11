/**
 * Server-Sent Events (SSE) Manager
 * 
 * Manages real-time communication for live updates like AI-generated title changes.
 * Provides connection management and event broadcasting to specific users.
 */

export interface SSEEvent {
  type: string;
  data?: unknown;
  timestamp?: number;
}

export interface NameUpdatedEvent extends SSEEvent {
  type: 'name_updated';
  data: {
    environmentId: string;
    name: string;
    userId: string;
  };
}

export interface ConnectionEvent extends SSEEvent {
  type: 'connected' | 'ping';
  message?: string;
}

export type EnvironmentsSSEEvent = NameUpdatedEvent | ConnectionEvent;

/**
 * Broadcast a name update event to the environment owner
 * @param environmentId - The ID of the environment that was updated
 * @param name - The new name
 * @param userId - The user ID who owns the environment
 */
export function broadcastNameUpdate(environmentId: string, name: string, userId: string): void {
  const eventData: NameUpdatedEvent = {
    type: 'name_updated',
    data: {
      environmentId,
      name,
      userId,
    },
    timestamp: Date.now(),
  };

  try {
    const controller = global.sseConnections?.get(userId);
    
    if (controller) {
      const event = `data: ${JSON.stringify(eventData)}

`;
      controller.enqueue(new TextEncoder().encode(event));
    }
  } catch (error) {
    console.error('Error broadcasting name update:', error);
  }
}

/**
 * Get the number of active SSE connections
 * @returns The number of active connections
 */
export function getActiveConnectionsCount(): number {
  return global.sseConnections?.size || 0;
}

/**
 * Check if a user has an active SSE connection
 * @param userId - The user ID to check
 * @returns True if the user has an active connection
 */
export function hasActiveConnection(userId: string): boolean {
  return global.sseConnections?.has(userId) || false;
}

/**
 * Close SSE connection for a specific user
 * @param userId - The user ID to disconnect
 */
export function closeUserConnection(userId: string): void {
  try {
    const controller = global.sseConnections?.get(userId);
    
    if (controller) {
      controller.close();
      global.sseConnections?.delete(userId);
    }
  } catch (error) {
    console.error(`Error closing SSE connection for user ${userId}:`, error);
  }
}