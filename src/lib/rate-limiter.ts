// src/lib/rate-limiter.ts
/**
 * @fileOverview A utility for rate-limiting API requests based on IP address.
 *
 * This implementation uses an in-memory LRU (Least Recently Used) cache.
 * It's suitable for single-instance deployments or serverless environments where
 * instances are ephemeral and sophisticated coordination is not required.
 *
 * For applications that scale across multiple server instances, a more robust,
 * distributed caching solution like Redis is recommended to ensure consistent
 * rate limiting across the entire application.
 */

import { LRUCache } from 'lru-cache';
import { type NextRequest, NextResponse } from 'next/server';

// --- Constants for Configuration ---
const DEFAULT_REQUESTS_PER_INTERVAL = 10; // Default max requests per interval for a single token.
const DEFAULT_INTERVAL_MS = 60000; // Default interval window: 1 minute.
const CACHE_MAX_SIZE = 500; // The maximum number of unique tokens (IPs) to store in the cache.
const CACHE_TTL_MS = 60000; // Time-to-live for each cache entry: 1 minute.

/**
 * Type definition for the rate limiter configuration options.
 */
type RateLimiterOptions = {
  /** The maximum number of requests allowed from a single token within the interval. */
  uniqueTokenPerInterval?: number;
  /** The time window in milliseconds to track requests. */
  interval?: number;
};

// Initialize the LRU cache with configured constants.
// `lru-cache` automatically handles evicting the least recently used items
// when the `max` size is reached, making it memory-efficient.
const tokenCache = new LRUCache<string, number[]>({
  max: CACHE_MAX_SIZE,
  ttl: CACHE_TTL_MS,
});

/**
 * Creates a rate limiter instance with configurable options.
 * @param {RateLimiterOptions} options - Optional configuration for the rate limiter.
 * @returns An object with a `check` method to perform the rate limit check.
 */
export function rateLimiter(options?: RateLimiterOptions) {
  const {
    uniqueTokenPerInterval = DEFAULT_REQUESTS_PER_INTERVAL,
    interval = DEFAULT_INTERVAL_MS,
  } = options || {};

  return {
    /**
     * Checks if a request from a given IP address has exceeded the rate limit.
     * @param {NextRequest} request - The incoming Next.js request object. The `NextRequest` type is
     * the specific, correct type provided by Next.js for middleware and API routes,
     * containing necessary properties like `ip`.
     * @returns {NextResponse | null} A `NextResponse` object with status 429 if rate-limited, otherwise `null`.
     */
    check: (request: NextRequest): NextResponse | null => {
      // Use the request's IP address as the unique token.
      // Fallback to '127.0.0.1' for local development or environments where IP is not forwarded.
      const token = request.ip ?? '127.0.0.1';
      const now = Date.now();

      // Get the array of request timestamps for this token from the cache.
      const timestamps = tokenCache.get(token) || [];

      // Filter out timestamps that are older than the defined interval.
      const relevantTimestamps = timestamps.filter((ts) => now - ts < interval);

      // If the number of recent requests is greater than or equal to the limit, block the request.
      if (relevantTimestamps.length >= uniqueTokenPerInterval) {
        console.warn(`RATE LIMIT EXCEEDED for IP: ${token}`);
        return new NextResponse(
          JSON.stringify({ error: 'Too Many Requests' }),
          { status: 429 } // HTTP 429 Too Many Requests
        );
      }

      // The request is not rate-limited. Add the current timestamp and update the cache.
      relevantTimestamps.push(now);
      tokenCache.set(token, relevantTimestamps);

      // Log successful (allowed) requests for monitoring purposes.
      // In a high-traffic production environment, this might be too noisy and
      // could be replaced with a more sophisticated metrics system.
      console.log(`Request allowed for IP: ${token}. Count: [${relevantTimestamps.length}/${uniqueTokenPerInterval}]`);

      return null; // Return null to indicate the request can proceed.
    },
  };
}
