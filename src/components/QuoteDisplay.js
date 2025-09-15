/**
 * QuoteDisplay - Handles quote display with loading and error states
 * Provides a clean interface for showing stock quote information
 */

export class QuoteDisplay {
  constructor(containerElement) {
    this.container = containerElement;
    this.currentQuote = null;
  }

  /**
   * Show loading state
   */
  showLoading() {
    this.container.innerHTML = `
      <div class="quote__loading" role="status" aria-live="polite">
        <div class="loading__spinner"></div>
        <div class="loading__text">Fetching quote data...</div>
      </div>
    `;
  }

  /**
   * Show error state
   * @param {string} message - Error message to display
   */
  showError(message) {
    this.container.innerHTML = `
      <div class="quote__error" role="alert" aria-live="assertive">
        <div class="error__icon">⚠️</div>
        <div class="error__message">${message}</div>
      </div>
    `;
  }

  /**
   * Display quote data
   * @param {Object} quote - Quote data object
   */
  displayQuote(quote) {
    this.currentQuote = quote;

    const changeClass = quote.isPositive ? "positive" : "negative";
    const changeSymbol = quote.isPositive ? "+" : "";

    this.container.innerHTML = `
      <div class="quote__main">
        <div class="quote__header">
          <h2 class="quote__symbol">${quote.symbol}</h2>
          <div class="quote__price">$${quote.price.toFixed(2)}</div>
        </div>
        
        <div class="quote__change ${changeClass}">
          <span class="change__amount">${changeSymbol}${quote.change.toFixed(
      2
    )}</span>
          <span class="change__percent">(${changeSymbol}${quote.changePercent.toFixed(
      2
    )}%)</span>
        </div>
      </div>
      
      <div class="quote__details">
        <div class="details__row">
          <span class="details__label">Open:</span>
          <span class="details__value">$${quote.open.toFixed(2)}</span>
        </div>
        <div class="details__row">
          <span class="details__label">High:</span>
          <span class="details__value">$${quote.high.toFixed(2)}</span>
        </div>
        <div class="details__row">
          <span class="details__label">Low:</span>
          <span class="details__value">$${quote.low.toFixed(2)}</span>
        </div>
        <div class="details__row">
          <span class="details__label">Previous Close:</span>
          <span class="details__value">$${quote.previousClose.toFixed(2)}</span>
        </div>
        <div class="details__row">
          <span class="details__label">Volume:</span>
          <span class="details__value">${quote.volume.toLocaleString()}</span>
        </div>
        <div class="details__row">
          <span class="details__label">Latest Trading Day:</span>
          <span class="details__value">${quote.latestTradingDay}</span>
        </div>
      </div>
    `;
  }

  /**
   * Clear the quote display
   */
  clear() {
    this.container.innerHTML = "";
    this.currentQuote = null;
  }

  /**
   * Get current quote data
   */
  getCurrentQuote() {
    return this.currentQuote;
  }

  /**
   * Check if currently displaying a quote
   */
  hasQuote() {
    return this.currentQuote !== null;
  }
}
