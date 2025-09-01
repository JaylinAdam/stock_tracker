const API_KEY_2 = "XC6KZS8SN2H4UKNN";
const API_KEY = "2U3E0049FATW3HOV";

export class Stock {
  constructor(ticker = "NONE") {
    this.ticker = (
      typeof ticker === "string" ? ticker : String(ticker)
    ).toUpperCase();
    this.price = null;
  }

  // METHOD: Set price
  setPrice(price) {
    const number = Number(price);
    this.price = Number.isFinite(number) ? number : null;
  }

  // METHOD: Display output
  display() {
    if (this.price === null) {
      return `Ticker: ${this.ticker}
                <br>Price: Not set`;
    }

    return `Ticker: ${this.ticker}
              <br>Price: $${this.price}`;
  }

  // METHOD: Create Stock object by fetching live data from API
  static async fromTicker(ticker) {
    const stock = new Stock(ticker);
    const price = await Stock.getPrice(ticker);
    stock.setPrice(price);
    return stock;
  }

  // METHOD: Recreaet Stock object from previously saved data
  static fromSaved(ticker, price) {
    const stock = new Stock(ticker);
    stock.setPrice(price);
    return stock;
  }

  // METHOD: Refresh price data
  async refreshPrice() {
    const price = await Stock.getPrice(this.ticker);
    this.setPrice(price);
    return this.price;
  }

  // METHOD: Request stock price from API
  static async getPrice(ticker) {
    const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${ticker}&apikey=${API_KEY}`;

    // Try to obtain data from API
    try {
      const response = await fetch(url);
      const data = await response.json();

      // Handle rate limits
      if (data.Note || data.Information) {
        throw new Error("API rate limit or throttle hit. Try again shortly.");
      }

      // If valid data return as number to two decimals
      if (data["Global Quote"] && data["Global Quote"]["05. price"]) {
        return Number(data["Global Quote"]["05. price"]);
      } else {
        throw new Error("Invalid ticker or no data found.");
      }
    } catch (error) {
      console.error("Error fetching price:", error);
      return null;
    }
  }
}
