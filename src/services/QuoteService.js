/**
 * QuoteService - Handles Alpha Vantage GLOBAL_QUOTE API calls
 * Provides quote fetching with error handling and rate limiting
 */

const API_KEY = "2U3E0049FATW3HOV";
const BASE_URL = "https://www.alphavantage.co/query";

export class QuoteService {
  constructor() {
    this.cache = new Map();
    this.cacheExpiry = 5 * 60 * 1000; // 5 minutes cache
  }

  /**
   * Fetch quote data for a symbol
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

    try {
      const url = `${BASE_URL}?function=GLOBAL_QUOTE&symbol=${encodeURIComponent(
        symbol
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

      // Process and validate quote data
      const quote = this._processQuoteData(data, symbol);

      if (quote) {
        // Cache the result
        this.cache.set(cacheKey, {
          data: quote,
          timestamp: Date.now(),
        });
      }

      return quote;
    } catch (error) {
      console.error("Quote fetch error:", error);
      return null;
    }
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
