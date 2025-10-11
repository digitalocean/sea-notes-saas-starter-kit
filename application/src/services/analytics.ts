interface AnalyticsEvent {
  event: string;
  userId?: string;
  properties?: Record<string, any>;
  timestamp?: Date;
}

interface UserMetrics {
  totalUsers: number;
  activeUsers: number;
  newUsers: number;
  churnRate: number;
}

class AnalyticsService {
  private events: AnalyticsEvent[] = [];

  track(event: string, userId?: string, properties?: Record<string, any>) {
    const analyticsEvent: AnalyticsEvent = {
      event,
      userId,
      properties,
      timestamp: new Date(),
    };

    this.events.push(analyticsEvent);
    
    // In production, send to analytics service
    if (typeof window !== 'undefined') {
      console.log('Analytics Event:', analyticsEvent);
    }
  }

  async getUserMetrics(): Promise<UserMetrics> {
    // Mock implementation - replace with actual database queries
    return {
      totalUsers: 1250,
      activeUsers: 890,
      newUsers: 45,
      churnRate: 2.3,
    };
  }

  getEvents(userId?: string): AnalyticsEvent[] {
    if (userId) {
      return this.events.filter(event => event.userId === userId);
    }
    return this.events;
  }
}

export const analytics = new AnalyticsService();
export type { AnalyticsEvent, UserMetrics };
