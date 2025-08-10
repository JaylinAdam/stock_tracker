import { Stock } from "./models/Stock.js";

const container = document.getElementById("container"),
  button = document.getElementById("button");

// METHOD: Display stock
function displayStock(stock, price) {
  // Clear previous content
  container.innerHTML = "";

  // Return if input empty

  if (stock.ticker === "") {
    alert("Please enter a valid ticker");
    return;
  }

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
button.addEventListener("click", () => {
  const input = document.getElementById("input").value.trim(),
    stock = new Stock(input),
    price = stock.getPrice();

  displayStock(stock, price);
});
