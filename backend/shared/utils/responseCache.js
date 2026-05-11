/**
 * Response Cache Utility
 * 
 * A lightweight in-memory TTL cache to avoid re-calling LLMs for identical inputs.
 * - Uses a Map with TTL per entry.
 * - Cache key = SHA-256 hash of the input string.
 * - Different TTLs for different data types (recommendations live longer than routing).
 * 
 * Usage:
 *   const cache = require('./responseCache');
 *   const key = cache.hash("React, Node.js");
 *   if (cache.has(key)) return cache.get(key);
 *   const result = await callLLM(...);
 *   cache.set(key, result, cache.TTL.RECOMMENDATIONS);
 *   return result;
 */

const crypto = require('crypto');

// TTL presets in milliseconds
const TTL = {
  ROUTER:          2 * 60 * 1000,   //  2 minutes  — routing decisions can change with context
  SKILL_ANALYSIS:  20 * 60 * 1000,  // 20 minutes  — skill gaps don't change frequently
  JOB_RECS:        30 * 60 * 1000,  // 30 minutes  — job recommendations are stable
  RESPONSE:        5 * 60 * 1000,   //  5 minutes  — conversational responses (shorter TTL)
};

class ResponseCache {
  constructor() {
    this.store = new Map();
    
    // Periodically clean up expired entries every 5 minutes
    setInterval(() => this._evictExpired(), 5 * 60 * 1000);
  }

  /**
   * Generate a SHA-256 cache key from any string/object input
   */
  hash(input) {
    const str = typeof input === 'string' ? input : JSON.stringify(input);
    return crypto.createHash('sha256').update(str).digest('hex').substring(0, 16);
  }

  /**
   * Check if a valid (non-expired) cached result exists
   */
  has(key) {
    if (!this.store.has(key)) return false;
    const { expiresAt } = this.store.get(key);
    if (Date.now() > expiresAt) {
      this.store.delete(key);
      return false;
    }
    return true;
  }

  /**
   * Get a cached result
   */
  get(key) {
    if (!this.has(key)) return null;
    const entry = this.store.get(key);
    console.log(`[Cache] HIT for key: ${key}`);
    return entry.value;
  }

  /**
   * Store a result with a TTL
   * @param {string} key - Cache key
   * @param {*} value - Value to cache
   * @param {number} ttlMs - Time-to-live in milliseconds (use TTL presets)
   */
  set(key, value, ttlMs = TTL.RESPONSE) {
    this.store.set(key, {
      value,
      expiresAt: Date.now() + ttlMs,
    });
    console.log(`[Cache] STORED key: ${key} (TTL: ${ttlMs / 1000}s)`);
  }

  /**
   * Manually delete a cache entry
   */
  delete(key) {
    this.store.delete(key);
  }

  /**
   * Clear all cache entries
   */
  clear() {
    this.store.clear();
    console.log('[Cache] Cleared all entries.');
  }

  /**
   * Remove any entries that have expired (background cleanup)
   */
  _evictExpired() {
    const now = Date.now();
    let count = 0;
    for (const [key, entry] of this.store.entries()) {
      if (now > entry.expiresAt) {
        this.store.delete(key);
        count++;
      }
    }
    if (count > 0) console.log(`[Cache] Evicted ${count} expired entries.`);
  }

  /**
   * Log current cache size
   */
  stats() {
    return { size: this.store.size, keys: [...this.store.keys()] };
  }
}

// Export as a singleton — shared across all agents in the same process
const cache = new ResponseCache();
cache.TTL = TTL;

module.exports = cache;
