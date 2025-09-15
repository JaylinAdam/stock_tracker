/**
 * SearchService - Handles Alpha Vantage SYMBOL_SEARCH API calls
 * Provides debouncing, caching, and rate limiting for search functionality
 */

const API_KEY = "2U3E0049FATW3HOV";
const BASE_URL = "https://www.alphavantage.co/query";

export class SearchService {
  constructor() {
    this.cache = new Map();
    this.debounceTimer = null;
    this.minQueryLength = 2;
    this.debounceDelay = 350; // 350ms debounce for rate limiting
  }

  /**
   * Search for stock symbols with debouncing and caching
   * @param {string} query - Search query
   * @param {Function} callback - Callback function to handle results
   */
  search(query, callback) {
    // Clear existing timer
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    // Check minimum length
    if (query.length < this.minQueryLength) {
      callback([]);
      return;
    }

    // Check cache first
    const cachedResults = this.cache.get(query.toLowerCase());
    if (cachedResults) {
      callback(cachedResults);
      return;
    }

    // Debounce the API call
    this.debounceTimer = setTimeout(() => {
      this._performSearch(query, callback);
    }, this.debounceDelay);
  }

  /**
   * Perform the actual API search
   * @private
   */
  async _performSearch(query, callback) {
    try {
      const url = `${BASE_URL}?function=SYMBOL_SEARCH&keywords=${encodeURIComponent(
        query
      )}&apikey=${API_KEY}`;

      const response = await fetch(url);
      const data = await response.json();

      // Handle rate limits
      if (data.Note || data.Information) {
        throw new Error("API rate limit exceeded. Please try again shortly.");
      }

      // Handle API errors
      if (data["Error Message"]) {
        throw new Error(data["Error Message"]);
      }

      // Process results
      const results = this._processSearchResults(data);

      // Cache the results
      this.cache.set(query.toLowerCase(), results);

      callback(results);
    } catch (error) {
      console.error("Search error:", error);
      callback([]);
    }
  }

  /**
   * Process raw API response into standardized format
   * @private
   */
  _processSearchResults(data) {
    if (!data.bestMatches || !Array.isArray(data.bestMatches)) {
      return [];
    }

    return data.bestMatches
      .map((match) => ({
        symbol: match["1. symbol"],
        name: match["2. name"],
        type: match["3. type"],
        region: match["4. region"],
        marketOpen: match["5. marketOpen"],
        marketClose: match["6. marketClose"],
        timezone: match["7. timezone"],
        currency: match["8. currency"],
        matchScore: match["9. matchScore"],
      }))
      .filter((match) => match.symbol && match.name);
  }

  /**
   * Clear the search cache
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
