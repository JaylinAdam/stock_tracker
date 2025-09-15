# Stock Tracker - Autocomplete Search Flow

A modern, accessible stock search application with real-time autocomplete functionality powered by Alpha Vantage APIs.

## Features

### 🔍 **Autocomplete Search**

- **Real-time suggestions** as you type (minimum 2 characters)
- **Keyboard navigation** with Arrow Up/Down, Enter to select, Esc to close
- **Mouse support** with hover and click selection
- **Debounced API calls** (350ms) to respect rate limits
- **Intelligent caching** to reduce API calls and improve performance

### 📊 **Quote Display**

- **Live stock quotes** with current price, change, and change percentage
- **Detailed information** including open, high, low, previous close, volume, and trading day
- **Loading states** with animated spinner
- **Error handling** with user-friendly messages
- **Color-coded changes** (green for positive, red for negative)

### ♿ **Accessibility**

- **ARIA attributes** for screen reader compatibility
- **Keyboard navigation** support
- **Semantic HTML** structure
- **Focus management** and proper tab order

### 🚀 **Performance**

- **Rate limit protection** with debouncing and caching
- **Modular architecture** for maintainability
- **No build tools required** - runs directly in modern browsers
- **Responsive design** for mobile and desktop

## Architecture

### Services

- **`SearchService.js`** - Handles Alpha Vantage SYMBOL_SEARCH API calls
- **`QuoteService.js`** - Manages Alpha Vantage GLOBAL_QUOTE API calls

### Components

- **`AutocompleteSearch.js`** - Autocomplete functionality with keyboard/mouse support
- **`QuoteDisplay.js`** - Quote rendering with loading and error states
- **`AlertSystem.js`** - Enhanced alert system for user feedback

### Main App

- **`app.js`** - Main application orchestrating all components
- **`index.html`** - Semantic HTML structure with ARIA attributes
- **`main.css`** - Modern, responsive styling

## Usage

### Basic Search

1. **Type** a company name or symbol (e.g., "Apple", "AAPL", "Boeing")
2. **Select** from the dropdown suggestions using mouse or keyboard
3. **View** the live quote data with detailed information

### Keyboard Navigation

- **Arrow Up/Down** - Navigate through suggestions
- **Enter** - Select highlighted suggestion
- **Escape** - Close suggestions dropdown
- **Tab** - Move focus away from search

### API Rate Limiting

- **Debouncing** - 350ms delay between keystrokes
- **Caching** - Search results cached per query
- **Minimum length** - 2 characters required before API call
- **Error handling** - Graceful handling of rate limit errors

## Implementation Details

### Debouncing & Caching

```javascript
// SearchService implements 350ms debounce
this.debounceDelay = 350;

// Results cached per query to avoid duplicate API calls
this.cache.set(query.toLowerCase(), results);
```

### Keyboard Navigation

```javascript
// Arrow key navigation with proper ARIA updates
_handleKeydown(e) {
  switch (e.key) {
    case 'ArrowDown': this._navigateDown(); break;
    case 'ArrowUp': this._navigateUp(); break;
    case 'Enter': this._selectCurrent(); break;
    case 'Escape': this._hideSuggestions(); break;
  }
}
```

### Accessibility Features

```html
<!-- Proper ARIA attributes for screen readers -->
<input role="combobox" aria-expanded="false" aria-autocomplete="list" />
<div role="listbox" aria-label="Stock suggestions"></div>
```

## Browser Support

- **Chrome** 60+
- **Firefox** 55+
- **Safari** 12+
- **Edge** 79+

## API Configuration

The app uses Alpha Vantage APIs with the following configuration:

- **SYMBOL_SEARCH** - For autocomplete suggestions
- **GLOBAL_QUOTE** - For live stock quotes
- **Rate Limit** - 5 requests per minute (free tier)
- **Caching** - 5 minutes for quote data

## Development

### File Structure

```
src/
├── services/
│   ├── SearchService.js      # Symbol search API
│   └── QuoteService.js       # Quote data API
├── components/
│   ├── AutocompleteSearch.js # Search UI component
│   ├── QuoteDisplay.js       # Quote display component
│   └── AlertSystem.js        # Alert/notification system
├── models/
│   └── Stock.js              # Legacy stock model
├── app.js                    # Main application
└── index.html               # HTML structure

assets/
└── styles/
    └── main.css             # Application styles
```

### Debugging

Open browser console for helpful commands:

```javascript
// Clear all content
stockTrackerApp.clearAll();

// Get app statistics
stockTrackerApp.getStats();
```

## Future Enhancements

- **Portfolio tracking** - Save and manage multiple stocks
- **Price alerts** - Set custom price notifications
- **Historical data** - View price charts and trends
- **Watchlists** - Organize stocks by categories
- **Real-time updates** - WebSocket integration for live data

## License

MIT License - Feel free to use and modify for your projects.
