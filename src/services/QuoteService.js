/**
 * QuoteService - Handles Alpha Vantage GLOBAL_QUOTE API calls
 * Provides quote fetching with error handling and rate limiting
 */

const API_KEYS = ["6N4AFLFA3ODCGHO2"];

const BASE_URL = "https://www.alphavantage.co/query";

export class QuoteService {
  constructor() {
    this.cache = new Map();
    this.cacheExpiry = 5 * 60 * 1000; // 5 minutes cache
    this.currentKeyIndex = 0;
    this.keyFailures = new Map(); // Track failures per key
    this.keyCooldown = 60 * 1000; // 1 minute cooldown after rate limit
  }

  /**
   * Get an available API key (current key if available, otherwise next available)
   * @private
   */
  _getAvailableApiKey() {
    const now = Date.now();

    // Find a key that's not in cooldown
    for (let i = 0; i < API_KEYS.length; i++) {
      const keyIndex = (this.currentKeyIndex + i) % API_KEYS.length;
      const key = API_KEYS[keyIndex];
      const lastFailure = this.keyFailures.get(key);

      if (!lastFailure || now - lastFailure > this.keyCooldown) {
        this.currentKeyIndex = keyIndex;
        return key;
      }
    }

    // If all keys are in cooldown, use the current one anyway
    return API_KEYS[this.currentKeyIndex];
  }

  /**
   * Mark an API key as failed (rate limited)
   * @private
   */
  _markKeyFailed(key) {
    this.keyFailures.set(key, Date.now());
    console.log(
      `API key ${key.substring(
        0,
        8
      )}... marked as failed, switching to next key`
    );
  }

  /**
   * Fetch quote data for a symbol with automatic retry on rate limits
   * @param {string} symbol - Stock symbol
   * @returns {Promise<Object|null>} Quote data or null if error
   */
  async getQuote(symbol) {
    const cacheKey = symbol.toUpperCase();

    // Check cache first
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
      return cached.data;
    }

    // Try with available keys, retry until we find one that works
    let lastError = null;
    const maxAttempts = API_KEYS.length * 2; // Allow trying each key twice

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        const apiKey = this._getAvailableApiKey();
        const url = `${BASE_URL}?function=GLOBAL_QUOTE&symbol=${encodeURIComponent(
          symbol
        )}&apikey=${apiKey}`;

        const response = await fetch(url);
        const data = await response.json();

        // Handle rate limits - mark key as failed and retry with next key
        if (data.Note || data.Information) {
          this._markKeyFailed(apiKey);
          console.log(
            `Rate limit hit on attempt ${
              attempt + 1
            }, retrying with next available key...`
          );

          // Create new error and continue to next iteration
          lastError = new Error("API rate limit exceeded");
          lastError.type = "RATE_LIMIT";
          continue;
        }

        // Handle API errors
        if (data["Error Message"]) {
          throw new Error(data["Error Message"]);
        }

        // Process and validate quote data
        const quote = this._processQuoteData(data, symbol);

        if (quote) {
          // Cache the result
          this.cache.set(cacheKey, {
            data: quote,
            timestamp: Date.now(),
          });
        }

        // Exit function and return quote
        return quote;
      } catch (error) {
        // If it's not a rate limit error, throw immediately
        if (error.type !== "RATE_LIMIT") {
          throw error;
        }
        // Store rate-limit error
        lastError = error;
      }
    }

    // All attempts failed and no available API keys
    if (lastError) {
      throw lastError;
    }

    // This should never be reached, but just in case
    throw new Error("Unexpected error in quote fetching");
  }

  /**
   * Process raw API response into standardized format
   * @private
   */
  _processQuoteData(data, symbol) {
    const globalQuote = data["Global Quote"];

    if (!globalQuote || !globalQuote["05. price"]) {
      return null;
    }

    const price = parseFloat(globalQuote["05. price"]);
    const change = parseFloat(globalQuote["09. change"]);
    const changePercent = parseFloat(
      globalQuote["10. change percent"].replace("%", "")
    );

    return {
      symbol: symbol.toUpperCase(),
      price: price,
      change: change,
      changePercent: changePercent,
      open: parseFloat(globalQuote["02. open"]),
      high: parseFloat(globalQuote["03. high"]),
      low: parseFloat(globalQuote["04. low"]),
      previousClose: parseFloat(globalQuote["08. previous close"]),
      volume: parseInt(globalQuote["06. volume"]),
      latestTradingDay: globalQuote["07. latest trading day"],
      isPositive: change >= 0,
    };
  }

  /**
   * Clear the quote cache
   */
  clearCache() {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }
}
