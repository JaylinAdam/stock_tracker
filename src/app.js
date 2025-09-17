/**
 * Stock Tracker App - Main Application
 * Integrates autocomplete search with quote display functionality
 */

import { AutocompleteSearch } from "./components/AutocompleteSearch.js";
import { QuoteDisplay } from "./components/QuoteDisplay.js";
import { AlertSystem } from "./components/AlertSystem.js";
import { QuoteService } from "./services/QuoteService.js";

class StockTrackerApp {
  constructor() {
    this.initializeElements();
    this.initializeServices();
    this.initializeComponents();
    this.bindEvents();
  }

  /**
   * Initialize DOM elements
   */
  initializeElements() {
    this.searchInput = document.getElementById("search-input");
    this.suggestionsContainer = document.getElementById("suggestions");
    this.quoteContainer = document.getElementById("quote-output-list");
    this.alertContainer = document.getElementById("alert-list");
    this.reminderButton = document.getElementById("quote-reminder-button");
  }

  /**
   * Initialize services
   */
  initializeServices() {
    this.quoteService = new QuoteService();
  }

  /**
   * Initialize components
   */
  initializeComponents() {
    // Initialize alert system
    this.alertSystem = new AlertSystem(this.alertContainer);

    // Initialize quote display
    this.quoteDisplay = new QuoteDisplay(this.quoteContainer);

    // Initialize autocomplete search
    this.autocompleteSearch = new AutocompleteSearch(
      this.searchInput,
      this.suggestionsContainer,
      (suggestion) => this.handleSymbolSelection(suggestion)
    );
  }

  /**
   * Bind event listeners
   */
  bindEvents() {
    // Handle form submission
    const form = this.searchInput.closest("form");
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      this.handleFormSubmit();
    });

    // Handle reminder button (if it exists)
    if (this.reminderButton) {
      this.reminderButton.addEventListener("click", () => {
        this.handleReminderClick();
      });
    }
  }

  /**
   * Handle symbol selection from autocomplete
   * @param {Object} suggestion - Selected suggestion object
   */
  async handleSymbolSelection(suggestion) {
    if (!suggestion || !suggestion.symbol) {
      this.alertSystem.warning("Please select a valid stock symbol");
      return;
    }

    await this.fetchAndDisplayQuote(suggestion.symbol);
  }

  /**
   * Handle form submission
   */
  async handleFormSubmit() {
    const query = this.autocompleteSearch.getValue();

    if (!query) {
      this.alertSystem.warning("Please enter a stock symbol or company name");
      return;
    }

    // Hide suggestions immediately on form submission
    this.autocompleteSearch.hideSuggestions();

    // If it looks like a symbol (short, uppercase), try to fetch directly
    if (this.isLikelySymbol(query)) {
      await this.fetchAndDisplayQuote(query.toUpperCase());
    } else {
      this.alertSystem.warning(
        "Invalid symbol format. Please enter a valid symbol or select from suggestions."
      );
    }
  }

  /**
   * Fetch and display quote for a symbol
   * @param {string} symbol - Stock symbol
   */
  async fetchAndDisplayQuote(symbol) {
    try {
      // Show loading state
      this.quoteDisplay.showLoading();
      this.alertSystem.clear();

      // Fetch quote data
      const quote = await this.quoteService.getQuote(symbol);

      if (!quote) {
        this.quoteDisplay.showError(
          "Unable to fetch quote data. Please check ticker symbol and try again."
        );
        this.alertSystem.error("Failed to fetch quote data");
        return;
      }

      // Display the quote
      this.quoteDisplay.displayQuote(quote);
      this.alertSystem.success(`Quote loaded for ${symbol}`);

      // Show reminder button if it exists
      if (this.reminderButton) {
        this.reminderButton.classList.add("active");
      }
    } catch (error) {
      console.error("Error fetching quote:", error);
      console.log("Error type:", error.type);
      console.log("Error message:", error.message);

      // Handle rate limit specifically
      if (error.type === "RATE_LIMIT") {
        this.quoteDisplay.showError(
          "API rate limit exceeded. Please wait a moment before trying again."
        );
        this.alertSystem.warning(
          "Rate limit hit - please wait before trying again"
        );
      } else {
        this.quoteDisplay.showError(
          "An error occurred while fetching the quote. Please try again."
        );
        this.alertSystem.error("An error occurred while fetching the quote");
      }
    }
  }

  /**
   * Handle reminder button click
   */
  handleReminderClick() {
    const currentQuote = this.quoteDisplay.getCurrentQuote();
    if (currentQuote) {
      this.alertSystem.info(
        `Reminder feature not yet implemented for ${currentQuote.symbol}`
      );
    } else {
      this.alertSystem.warning("No quote data available for reminder");
    }
  }

  /**
   * Clear all content
   */
  clearAll() {
    this.quoteDisplay.clear();
    this.alertSystem.clear();
    this.autocompleteSearch.clear();

    if (this.reminderButton) {
      this.reminderButton.classList.remove("active");
    }
  }

  /**
   * Get app statistics
   */
  getStats() {
    return {
      searchCache: this.autocompleteSearch.searchService.getCacheStats(),
      quoteCache: this.quoteService.getCacheStats(),
      hasQuote: this.quoteDisplay.hasQuote(),
      hasAlert: this.alertSystem.hasAlert(),
    };
  }

  /**
   * Check if a query looks like a stock symbol
   * @param {string} query - The query to check
   * @returns {boolean} - True if it looks like a symbol
   */
  isLikelySymbol(query) {
    // Stock symbols are typically 1-5 characters, alphanumeric, uppercase
    return /^[A-Z]{1,5}$/.test(query.trim().toUpperCase());
  }
}

/**
 * Initialize the app when DOM is loaded
 */
document.addEventListener("DOMContentLoaded", () => {
  window.stockTrackerApp = new StockTrackerApp();

  /**
   * Helpful console commands for debugging
   */
  console.log("Stock Tracker App initialized");
  console.log("Available commands:");
  console.log("- stockTrackerApp.clearAll() - Clear all content");
  console.log("- stockTrackerApp.getStats() - Get app statistics");
});
