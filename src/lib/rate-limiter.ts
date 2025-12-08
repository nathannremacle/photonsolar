// Simple in-memory rate limiter
// In production, use Redis or a proper rate limiting service

interface RateLimitEntry {
  count: number;
  resetTime: number;
  blocked: boolean;
  blockUntil?: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

// Configuration
const MAX_ATTEMPTS = 5; // Maximum attempts before blocking
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const BLOCK_DURATION_MS = 30 * 60 * 1000; // 30 minutes block after max attempts

export function checkRateLimit(identifier: string): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const entry = rateLimitStore.get(identifier);

  // Clean up old entries
  if (entry && entry.resetTime < now && !entry.blocked) {
    rateLimitStore.delete(identifier);
  }

  // Check if blocked
  if (entry?.blocked && entry.blockUntil && entry.blockUntil > now) {
    const remaining = Math.ceil((entry.blockUntil - now) / 1000);
    return {
      allowed: false,
      remaining: 0,
      resetAt: entry.blockUntil,
    };
  }

  // If block expired, reset
  if (entry?.blocked && entry.blockUntil && entry.blockUntil <= now) {
    rateLimitStore.delete(identifier);
  }

  // Get or create entry
  const currentEntry = rateLimitStore.get(identifier) || {
    count: 0,
    resetTime: now + WINDOW_MS,
    blocked: false,
  };

  // Check if we've exceeded the limit
  if (currentEntry.count >= MAX_ATTEMPTS) {
    // Block the identifier
    currentEntry.blocked = true;
    currentEntry.blockUntil = now + BLOCK_DURATION_MS;
    rateLimitStore.set(identifier, currentEntry);

    return {
      allowed: false,
      remaining: 0,
      resetAt: currentEntry.blockUntil,
    };
  }

  // Increment count
  currentEntry.count++;
  rateLimitStore.set(identifier, currentEntry);

  return {
    allowed: true,
    remaining: MAX_ATTEMPTS - currentEntry.count,
    resetAt: currentEntry.resetTime,
  };
}

export function resetRateLimit(identifier: string): void {
  rateLimitStore.delete(identifier);
}

// Clean up old entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetTime < now && (!entry.blocked || (entry.blockUntil && entry.blockUntil < now))) {
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000); // Clean up every 5 minutes

