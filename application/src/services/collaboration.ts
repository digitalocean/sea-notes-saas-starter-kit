interface CollaborationEvent {
  type: 'cursor' | 'selection' | 'edit' | 'join' | 'leave';
  userId: string;
  userName: string;
  noteId: string;
  data?: any;
  timestamp: number;
}

interface ActiveUser {
  id: string;
  name: string;
  cursor?: { line: number; column: number };
  selection?: { start: number; end: number };
  color: string;
  lastSeen: number;
}

class CollaborationService {
  private activeUsers = new Map<string, Map<string, ActiveUser>>();
  private listeners = new Map<string, ((users: ActiveUser[]) => void)[]>();
  private colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD'];

  joinNote(noteId: string, userId: string, userName: string): string {
    if (!this.activeUsers.has(noteId)) {
      this.activeUsers.set(noteId, new Map());
    }

    const noteUsers = this.activeUsers.get(noteId)!;
    const color = this.colors[noteUsers.size % this.colors.length];

    const user: ActiveUser = {
      id: userId,
      name: userName,
      color,
      lastSeen: Date.now(),
    };

    noteUsers.set(userId, user);
    this.notifyListeners(noteId);

    // Broadcast join event
    this.broadcastEvent({
      type: 'join',
      userId,
      userName,
      noteId,
      timestamp: Date.now(),
    });

    return color;
  }

  leaveNote(noteId: string, userId: string): void {
    const noteUsers = this.activeUsers.get(noteId);
    if (noteUsers) {
      const user = noteUsers.get(userId);
      noteUsers.delete(userId);
      
      if (noteUsers.size === 0) {
        this.activeUsers.delete(noteId);
      } else {
        this.notifyListeners(noteId);
      }

      // Broadcast leave event
      if (user) {
        this.broadcastEvent({
          type: 'leave',
          userId,
          userName: user.name,
          noteId,
          timestamp: Date.now(),
        });
      }
    }
  }

  updateCursor(noteId: string, userId: string, cursor: { line: number; column: number }): void {
    const noteUsers = this.activeUsers.get(noteId);
    const user = noteUsers?.get(userId);
    
    if (user) {
      user.cursor = cursor;
      user.lastSeen = Date.now();
      this.notifyListeners(noteId);

      this.broadcastEvent({
        type: 'cursor',
        userId,
        userName: user.name,
        noteId,
        data: cursor,
        timestamp: Date.now(),
      });
    }
  }

  updateSelection(noteId: string, userId: string, selection: { start: number; end: number }): void {
    const noteUsers = this.activeUsers.get(noteId);
    const user = noteUsers?.get(userId);
    
    if (user) {
      user.selection = selection;
      user.lastSeen = Date.now();
      this.notifyListeners(noteId);

      this.broadcastEvent({
        type: 'selection',
        userId,
        userName: user.name,
        noteId,
        data: selection,
        timestamp: Date.now(),
      });
    }
  }

  broadcastEdit(noteId: string, userId: string, edit: any): void {
    const noteUsers = this.activeUsers.get(noteId);
    const user = noteUsers?.get(userId);
    
    if (user) {
      user.lastSeen = Date.now();
      
      this.broadcastEvent({
        type: 'edit',
        userId,
        userName: user.name,
        noteId,
        data: edit,
        timestamp: Date.now(),
      });
    }
  }

  getActiveUsers(noteId: string): ActiveUser[] {
    const noteUsers = this.activeUsers.get(noteId);
    if (!noteUsers) return [];

    // Clean up inactive users (inactive for more than 30 seconds)
    const now = Date.now();
    const activeThreshold = 30 * 1000;

    for (const [userId, user] of noteUsers.entries()) {
      if (now - user.lastSeen > activeThreshold) {
        noteUsers.delete(userId);
      }
    }

    return Array.from(noteUsers.values());
  }

  subscribeToNote(noteId: string, callback: (users: ActiveUser[]) => void): () => void {
    if (!this.listeners.has(noteId)) {
      this.listeners.set(noteId, []);
    }

    this.listeners.get(noteId)!.push(callback);

    return () => {
      const callbacks = this.listeners.get(noteId);
      if (callbacks) {
        const index = callbacks.indexOf(callback);
        if (index > -1) {
          callbacks.splice(index, 1);
        }
      }
    };
  }

  private notifyListeners(noteId: string): void {
    const callbacks = this.listeners.get(noteId);
    if (callbacks) {
      const users = this.getActiveUsers(noteId);
      callbacks.forEach(callback => callback(users));
    }
  }

  private broadcastEvent(event: CollaborationEvent): void {
    // In a real implementation, this would send to WebSocket server
    console.log('Collaboration Event:', event);
  }
}

export const collaborationService = new CollaborationService();
export type { CollaborationEvent, ActiveUser };
