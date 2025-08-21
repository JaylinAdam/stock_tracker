export class Stock {
  constructor(ticker = "NONE") {
    this.ticker = (
      typeof ticker === "string" ? ticker : String(ticker)
    ).toUpperCase();
  }

  // METHOD: Get stock price from ticker
  async getPrice(apiKey) {
    const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${this.ticker}&apikey=${apiKey}`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      if (data["Global Quote"] && data["Global Quote"]["05. price"]) {
        return parseFloat(data["Global Quote"]["05. price"]).toFixed(2);
      } else {
        throw new Error("Invalid ticker or no data found");
      }
    } catch (error) {
      console.error("Error fetching price:", error);
      return null;
    }
  }
}
