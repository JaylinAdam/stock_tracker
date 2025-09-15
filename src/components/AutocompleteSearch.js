/**
 * AutocompleteSearch - Handles autocomplete search functionality
 * Provides keyboard navigation, mouse support, and accessibility features
 */

import { SearchService } from "../services/SearchService.js";

export class AutocompleteSearch {
  constructor(inputElement, suggestionsContainer, onSelect) {
    this.input = inputElement;
    this.suggestionsContainer = suggestionsContainer;
    this.onSelect = onSelect;
    this.searchService = new SearchService();

    this.selectedIndex = -1;
    this.suggestions = [];
    this.isOpen = false;

    this._bindEvents();
  }

  /**
   * Bind event listeners
   * @private
   */
  _bindEvents() {
    // Input events
    this.input.addEventListener("input", (e) => this._handleInput(e));
    this.input.addEventListener("keydown", (e) => this._handleKeydown(e));
    this.input.addEventListener("blur", (e) => this._handleBlur(e));
    this.input.addEventListener("focus", (e) => this._handleFocus(e));

    // Click outside to close
    document.addEventListener("click", (e) => this._handleClickOutside(e));
  }

  /**
   * Handle input changes
   * @private
   */
  _handleInput(e) {
    const query = e.target.value.trim();

    if (query.length === 0) {
      this._hideSuggestions();
      return;
    }

    this.searchService.search(query, (results) => {
      this.suggestions = results;
      this._displaySuggestions(results);
    });
  }

  /**
   * Handle keyboard navigation
   * @private
   */
  _handleKeydown(e) {
    if (!this.isOpen) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        this._navigateDown();
        break;
      case "ArrowUp":
        e.preventDefault();
        this._navigateUp();
        break;
      case "Enter":
        e.preventDefault();
        this._selectCurrent();
        break;
      case "Escape":
        e.preventDefault();
        this._hideSuggestions();
        break;
    }
  }

  /**
   * Handle input blur
   * @private
   */
  _handleBlur(e) {
    // Delay hiding to allow for click events on suggestions
    setTimeout(() => {
      if (!this.suggestionsContainer.contains(document.activeElement)) {
        this._hideSuggestions();
      }
    }, 150);
  }

  /**
   * Handle input focus
   * @private
   */
  _handleFocus(e) {
    if (this.suggestions.length > 0) {
      this._showSuggestions();
    }
  }

  /**
   * Handle clicks outside the component
   * @private
   */
  _handleClickOutside(e) {
    if (
      !this.input.contains(e.target) &&
      !this.suggestionsContainer.contains(e.target)
    ) {
      this._hideSuggestions();
    }
  }

  /**
   * Display search suggestions
   * @private
   */
  _displaySuggestions(suggestions) {
    this.suggestionsContainer.innerHTML = "";
    this.selectedIndex = -1;
    this.input.setAttribute("aria-activedescendant", "");

    if (suggestions.length === 0) {
      this._hideSuggestions();
      return;
    }

    suggestions.forEach((suggestion, index) => {
      const suggestionElement = this._createSuggestionElement(
        suggestion,
        index
      );
      this.suggestionsContainer.appendChild(suggestionElement);
    });

    this._showSuggestions();
  }

  /**
   * Create a suggestion element
   * @private
   */
  _createSuggestionElement(suggestion, index) {
    const element = document.createElement("div");
    element.className = "suggestion";
    element.setAttribute("role", "option");
    element.setAttribute("aria-selected", "false");
    element.setAttribute("data-index", index);
    element.id = `suggestion-${index}`;
    element.tabIndex = -1;

    element.innerHTML = `
      <div class="suggestion__symbol">${suggestion.symbol}</div>
      <div class="suggestion__name">${suggestion.name}</div>
      <div class="suggestion__details">
        <span class="suggestion__region">${suggestion.region}</span>
        <span class="suggestion__currency">${suggestion.currency}</span>
      </div>
    `;

    // Mouse events
    element.addEventListener("mouseenter", () => this._setSelectedIndex(index));
    element.addEventListener("click", () => this._selectSuggestion(suggestion));

    return element;
  }

  /**
   * Show suggestions dropdown
   * @private
   */
  _showSuggestions() {
    this.suggestionsContainer.classList.add("open");
    this.isOpen = true;
    this.input.setAttribute("aria-expanded", "true");
  }

  /**
   * Hide suggestions dropdown
   */
  hideSuggestions() {
    this.suggestionsContainer.classList.remove("open");
    this.isOpen = false;
    this.selectedIndex = -1;
    this.input.setAttribute("aria-expanded", "false");
  }

  /**
   * Hide suggestions dropdown (private method for internal use)
   * @private
   */
  _hideSuggestions() {
    this.hideSuggestions();
  }

  /**
   * Navigate down in suggestions
   * @private
   */
  _navigateDown() {
    if (this.selectedIndex < this.suggestions.length - 1) {
      this._setSelectedIndex(this.selectedIndex + 1);
    }
  }

  /**
   * Navigate up in suggestions
   * @private
   */
  _navigateUp() {
    if (this.selectedIndex > 0) {
      this._setSelectedIndex(this.selectedIndex - 1);
    }
  }

  /**
   * Set the selected index and update UI
   * @private
   */
  _setSelectedIndex(index) {
    // Remove previous selection
    const previousSelected = this.suggestionsContainer.querySelector(
      ".suggestion.selected"
    );
    if (previousSelected) {
      previousSelected.classList.remove("selected");
      previousSelected.setAttribute("aria-selected", "false");
    }

    // Set new selection
    this.selectedIndex = index;
    if (index >= 0 && index < this.suggestions.length) {
      const selectedElement = this.suggestionsContainer.querySelector(
        `[data-index="${index}"]`
      );
      if (selectedElement) {
        selectedElement.classList.add("selected");
        selectedElement.setAttribute("aria-selected", "true");
        this.input.setAttribute("aria-activedescendant", selectedElement.id);
      }
    } else {
      this.input.setAttribute("aria-activedescendant", "");
    }
  }

  /**
   * Select the currently highlighted suggestion
   * @private
   */
  _selectCurrent() {
    if (
      this.selectedIndex >= 0 &&
      this.selectedIndex < this.suggestions.length
    ) {
      const suggestion = this.suggestions[this.selectedIndex];
      this._selectSuggestion(suggestion);
    }
  }

  /**
   * Select a suggestion
   * @private
   */
  _selectSuggestion(suggestion) {
    this.input.value = suggestion.symbol;
    this._hideSuggestions();

    if (this.onSelect) {
      this.onSelect(suggestion);
    }
  }

  /**
   * Clear the search input and suggestions
   */
  clear() {
    this.input.value = "";
    this.hideSuggestions();
    this.suggestions = [];
  }

  /**
   * Focus the input
   */
  focus() {
    this.input.focus();
  }

  /**
   * Get current input value
   */
  getValue() {
    return this.input.value.trim();
  }

  /**
   * Set input value
   */
  setValue(value) {
    this.input.value = value;
  }
}
