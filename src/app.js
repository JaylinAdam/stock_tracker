import { Stock } from "./models/Stock.js";

const container = document.getElementById("container"),
  button = document.getElementById("button"),
  API_KEY = "XC6KZS8SN2H4UKNN";

// METHOD: Display stock
function displayStock(stock, price) {
  // Clear previous content
  container.innerHTML = "";

  // Create html elements
  const tickerEl = document.createElement("h2");
  tickerEl.textContent = `Ticker: ${stock.ticker}`;

  const priceEl = document.createElement("h2");
  priceEl.textContent = `Price: $${price}`;

  // Add elements to container
  container.appendChild(tickerEl);
  container.appendChild(priceEl);
}

// METHOD: Get stock price
button.addEventListener("click", async () => {
  const input = document.getElementById("input").value.trim(),
    stock = new Stock(input),
    price = await stock.getPrice(input);

  // If input is empty
  if (input === "") {
    alert("Please enter a ticker.");
    return;
  }

  // If valid ticker
  if (price) {
    displayStock(stock, price);
  } else {
    alert("Could not fetch price. Please check ticker symbol.");
  }
});
