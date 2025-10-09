import { NextRequest, NextResponse } from 'next/server';

// ============================================================================
// RATE LIMITING CORE LOGIC
// ============================================================================

interface RateLimitOptions {
  windowMs: number; // Time window in milliseconds
  max: number; // Maximum number of requests per window
  message?: string;
  keyGenerator?: (req: NextRequest) => string;
}

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

// In-memory store (in production, use Redis)
const store: RateLimitStore = {};

/**
 * Creates a rate limiter function
 */
export function createRateLimit(options: RateLimitOptions) {
  const { windowMs, max, message = 'Too many requests, please try again later.', keyGenerator } = options;

  return async (req: NextRequest): Promise<NextResponse | null> => {
    const now = Date.now();
    
    // Generate key for rate limiting (default: IP address)
    const key = keyGenerator ? keyGenerator(req) : getClientIP(req);

    // Clean up expired entries
    Object.keys(store).forEach(k => {
      if (store[k].resetTime < now) {
        delete store[k];
      }
    });

    // Get or create entry for this key
    if (!store[key]) {
      store[key] = {
        count: 0,
        resetTime: now + windowMs
      };
    }

    const entry = store[key];

    // Check if window has expired
    if (entry.resetTime < now) {
      entry.count = 0;
      entry.resetTime = now + windowMs;
    }

    // Increment counter
    entry.count++;

    // Check if limit exceeded
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

    // Rate limit passed
    return null;
  };
}

/**
 * Extract client IP address from request
 */
function getClientIP(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return req.ip || 'unknown';
}

// ============================================================================
// HIGHER-ORDER FUNCTION FOR API ROUTES
// ============================================================================

type Handler = (
  req: NextRequest,
  context?: any
) => Promise<NextResponse>;

/**
 * Higher-order function to wrap API route handlers with rate limiting
 */
export function withRateLimit(
  handler: Handler,
  options: RateLimitOptions
) {
  const rateLimiter = createRateLimit(options);

  return async (req: NextRequest, context?: any): Promise<NextResponse> => {
    // Apply rate limiting
    const rateLimitResponse = await rateLimiter(req);
    
    if (rateLimitResponse) {
      // Rate limit exceeded, return the rate limit response
      return rateLimitResponse;
    }

    // Rate limit passed, continue with the original handler
    return await handler(req, context);
  };
}

// ============================================================================
// FRONTEND ERROR HANDLING
// ============================================================================

export interface RateLimitError {
  error: string;
  retryAfter?: number;
  limit?: number;
  remaining?: number;
  resetTime?: string;
}

/**
 * Checks if a response is a rate limiting error (429)
 */
export function isRateLimitError(response: Response): boolean {
  return response.status === 429;
}

/**
 * Extracts rate limiting information from a 429 response
 */
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

/**
 * Formats a user-friendly rate limiting error message
 */
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

/**
 * Handles API responses and extracts appropriate error messages
 * Specifically handles rate limiting (429) errors with user-friendly messages
 */
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

  // Handle rate limiting specifically
  if (isRateLimitError(response)) {
    const rateLimitError = await getRateLimitError(response);
    return {
      success: false,
      error: formatRateLimitMessage(rateLimitError)
    };
  }

  // Handle other errors
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

// ============================================================================
// PREDEFINED RATE LIMITERS
// ============================================================================

export const generalRateLimit = createRateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10, // 10 requests per minute
  message: 'Too many API requests, please try again later.'
});

export const strictRateLimit = createRateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10, // 10 requests per minute
  message: 'Rate limit exceeded, please slow down.'
});

export const passwordResetRateLimit = createRateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // 5 password reset attempts per minute
  message: 'Too many password reset attempts, please try again later.'
});