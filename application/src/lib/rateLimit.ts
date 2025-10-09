import { NextRequest, NextResponse } from 'next/server';

interface RateLimitOptions {
  windowMs: number;
  max: number;
  message?: string;
  keyGenerator?: (req: NextRequest) => string;
}

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const store: RateLimitStore = {};

export function createRateLimit(options: RateLimitOptions) {
  const { windowMs, max, message = 'Too many requests, please try again later.', keyGenerator } = options;

  return async (req: NextRequest): Promise<NextResponse | null> => {
    const now = Date.now();
    
    const key = keyGenerator ? keyGenerator(req) : getClientIP(req);

    Object.keys(store).forEach(k => {
      if (store[k].resetTime < now) {
        delete store[k];
      }
    });

    if (!store[key]) {
      store[key] = {
        count: 0,
        resetTime: now + windowMs
      };
    }

    const entry = store[key];

    if (entry.resetTime < now) {
      entry.count = 0;
      entry.resetTime = now + windowMs;
    }

    entry.count++;

    if (entry.count > max) {
      const retryAfter = Math.ceil((entry.resetTime - now) / 1000);
      
      return NextResponse.json(
        {
          error: message,
          retryAfter,
          limit: max,
          remaining: 0,
          resetTime: new Date(entry.resetTime).toISOString()
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': max.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': entry.resetTime.toString(),
            'Retry-After': retryAfter.toString()
          }
        }
      );
    }

    return null;
  };
}

function getClientIP(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return req.ip || 'unknown';
}

type Handler = (
  req: NextRequest,
  context?: any
) => Promise<NextResponse>;

export function withRateLimit(
  handler: Handler,
  options: RateLimitOptions
) {
  const rateLimiter = createRateLimit(options);

  return async (req: NextRequest, context?: any): Promise<NextResponse> => {
    const rateLimitResponse = await rateLimiter(req);
    
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    return await handler(req, context);
  };
}

export interface RateLimitError {
  error: string;
  retryAfter?: number;
  limit?: number;
  remaining?: number;
  resetTime?: string;
}

export function isRateLimitError(response: Response): boolean {
  return response.status === 429;
}

export async function getRateLimitError(response: Response): Promise<RateLimitError> {
  try {
    const data = await response.json();
    return {
      error: data.error || 'Too many requests. Please try again later.',
      retryAfter: data.retryAfter,
      limit: data.limit,
      remaining: data.remaining,
      resetTime: data.resetTime
    };
  } catch {
    return {
      error: 'Too many requests. Please try again later.'
    };
  }
}

export function formatRateLimitMessage(error: RateLimitError): string {
  const { error: message, retryAfter } = error;
  
  if (retryAfter) {
    const minutes = Math.ceil(retryAfter / 60);
    if (minutes > 1) {
      return `${message} Please wait ${minutes} minutes before trying again.`;
    } else {
      return `${message} Please wait ${retryAfter} seconds before trying again.`;
    }
  }
  
  return message;
}

export async function handleApiResponse(response: Response): Promise<{
  success: boolean;
  message?: string;
  error?: string;
}> {
  if (response.ok) {
    const data = await response.json();
    return {
      success: true,
      message: data.message || (data.ok ? 'Success' : undefined)
    };
  }

  if (isRateLimitError(response)) {
    const rateLimitError = await getRateLimitError(response);
    return {
      success: false,
      error: formatRateLimitMessage(rateLimitError)
    };
  }

  try {
    const data = await response.json();
    return {
      success: false,
      error: data.error || `Request failed with status ${response.status}`
    };
  } catch {
    return {
      success: false,
      error: `Request failed with status ${response.status}`
    };
  }
}

export const generalRateLimit = createRateLimit({
  windowMs: 1 * 60 * 1000,
  max: 10,
  message: 'Too many API requests, please try again later.'
});

export const strictRateLimit = createRateLimit({
  windowMs: 1 * 60 * 1000,
  max: 10,
  message: 'Rate limit exceeded, please slow down.'
});

export const passwordResetRateLimit = createRateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: 'Too many password reset attempts, please try again later.'
});