import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

/**
 * Upstash Redis client
 * 
 * Environment variables required:
 * - UPSTASH_REDIS_REST_URL
 * - UPSTASH_REDIS_REST_TOKEN
 * 
 * Get these from: https://console.upstash.com/
 */
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

/**
 * Rate limiter for authentication endpoints
 * 
 * Configuration:
 * - 5 requests per 15 minutes per identifier (IP or email)
 * - After 5 failed attempts, block for 30 minutes
 */
export const authRateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "15 m"), // 5 requests per 15 minutes
  analytics: true,
  prefix: "@upstash/ratelimit/auth",
});

/**
 * Rate limiter for registration endpoints
 * 
 * Configuration:
 * - 3 registrations per hour per IP
 */
export const registrationRateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(3, "1 h"), // 3 registrations per hour
  analytics: true,
  prefix: "@upstash/ratelimit/registration",
});

/**
 * Rate limiter for password reset requests
 * 
 * Configuration:
 * - 3 requests per hour per email
 */
export const passwordResetRateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(3, "1 h"), // 3 requests per hour
  analytics: true,
  prefix: "@upstash/ratelimit/password-reset",
});

/**
 * Rate limiter for email verification resend
 * 
 * Configuration:
 * - 3 requests per hour per email
 */
export const emailVerificationRateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(3, "1 h"), // 3 requests per hour
  analytics: true,
  prefix: "@upstash/ratelimit/email-verification",
});

/**
 * Helper function to get client IP from request
 */
export function getClientIP(request: Request): string {
  // Try to get IP from various headers (for proxies/load balancers)
  const forwarded = request.headers.get("x-forwarded-for");
  const realIP = request.headers.get("x-real-ip");
  const cfConnectingIP = request.headers.get("cf-connecting-ip"); // Cloudflare

  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  if (realIP) {
    return realIP.trim();
  }
  if (cfConnectingIP) {
    return cfConnectingIP.trim();
  }

  return "unknown";
}

