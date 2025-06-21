// src/lib/rate-limiter.ts
// This file provides a utility for rate-limiting API requests based on IP address.
// It uses an in-memory LRU (Least Recently Used) cache to track request counts,
// which is memory-efficient and suitable for serverless environments where instances
// may be ephemeral.

import { LRUCache } from 'lru-cache';
import { type NextRequest, NextResponse } from 'next/server';

// Type definition for rate limiter options.
type Options = {
  uniqueTokenPerInterval?: number; // Max number of requests allowed per interval for a single token (IP).
  interval?: number; // The time window in milliseconds to track requests.
};

// Initialize the LRU cache.
// `max`: The maximum number of unique tokens (IPs) to store.
// `ttl`: The time-to-live for each entry in milliseconds. After this time, the entry is automatically removed.
const tokenCache = new LRUCache<string, number[]>({
  max: 500,
  ttl: 60 * 1000, // 1 minute
});

/**
 * Creates a rate limiter instance with configurable options.
 * @param {Options} options - Optional configuration for the rate limiter.
 * @returns An object with a `check` method to perform the rate limit check.
 */
export function rateLimiter(options?: Options) {
  const {
    uniqueTokenPerInterval = 10, // Default: 10 requests per minute
    interval = 60000, // Default: 1 minute
  } = options || {};

  return {
    /**
     * Checks if a request from a given IP address has exceeded the rate limit.
     * @param {NextRequest} request - The incoming Next.js request object.
     * @returns {NextResponse | null} A NextResponse object with status 429 if rate-limited, otherwise null.
     */
    check: (request: NextRequest): NextResponse | null => {
      // Use the request's IP address as the unique token. Fallback for local development.
      const token = request.ip ?? '127.0.0.1';
      const now = Date.now();

      // Get the array of timestamps for this token from the cache.
      const timestamps = tokenCache.get(token) || [];

      // Filter out timestamps that are older than the defined interval.
      const relevantTimestamps = timestamps.filter((ts) => now - ts < interval);

      // If the number of recent requests is greater than or equal to the limit, block the request.
      if (relevantTimestamps.length >= uniqueTokenPerInterval) {
        console.warn(`Rate limit exceeded for IP: ${token}`);
        return new NextResponse(
          JSON.stringify({ error: 'Too Many Requests' }),
          { status: 429 } // HTTP 429 Too Many Requests
        );
      }

      // The request is not rate-limited. Add the current timestamp and update the cache.
      relevantTimestamps.push(now);
      tokenCache.set(token, relevantTimestamps);

      return null; // Return null to indicate the request can proceed.
    },
  };
}
