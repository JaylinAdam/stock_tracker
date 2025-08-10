export class Stock {
  constructor(ticker = "NONE") {
    this.ticker = (
      typeof ticker === "string" ? ticker : String(ticker)
    ).toUpperCase();
  }

  // METHOD: Get stock price from ticker
  getPrice() {
    return (Math.random() * 1000).toFixed(2);
  }
}
