import { Stock } from "./models/Stock.js";

// CONSTANTS
const priceBtn = document.getElementById("price-button");
const saveBtn = document.getElementById("save-button");
const loadBtn = document.getElementById("load-button");
const stockContainer = document.getElementById("stock-container");
const entriesContainer = document.getElementById("entries-container");
const loadEntries = () => JSON.parse(localStorage.getItem("entries") || "{}");
const saveEntries = (data) =>
  localStorage.setItem("entries", JSON.stringify(data));

// FUNCTION: Add entry to storage
function addEntry(ticker, price) {
  const entries = loadEntries();

  // Create array if none
  if (!entries[ticker]) {
    entries[ticker] = [];
  }
  // Push entry into array
  entries[ticker] = { price, ts: Date.now() };

  // Save to local storage
  saveEntries(entries);
  console.log(entries);
}

// FUNCTION: Remove entry from storage
function removeEntry(ticker) {
  const entries = loadEntries();

  // Create new array without target entry
  const newEntries = entries.filter((e) => e.ticker !== ticker);

  // Save to local storage
  saveEntries(entries);
  console.log(entries);
}

// FUNCTION: Display stock output to document
function displayStock(stock, container) {
  // Create element
  const stockEl = document.createElement("h2");

  // Store display output
  stockEl.innerHTML = stock.display();

  // Append element to container
  container.appendChild(stockEl);
}

function clearContainer() {
  // Clear previous content
  stockContainer.innerHTML = "";
  entriesContainer.innerHTML = "";
}

// CLICK EVENT: Display stock entry on click
priceBtn.addEventListener("click", async (e) => {
  e.preventDefault();
  clearContainer();

  // Declare stock object and retrieve data from API
  const input = document.getElementById("stock-input").value.trim();
  const stock = await Stock.fromTicker(input);

  // If input is empty
  if (input === "") {
    alert("Please enter a ticker.");
    return;
  }

  // If valid ticker
  if (stock.price) {
    displayStock(stock, stockContainer);
    saveBtn.dataset.ticker = stock.ticker;
    saveBtn.dataset.price = stock.price;
  } else {
    alert("Could not fetch price. Please check ticker symbol.");
  }
});

//CLICK EVENT: Save stock entry on click
saveBtn.addEventListener("click", (e) => {
  e.preventDefault();

  const { ticker, price } = e.target.dataset;
  addEntry(ticker, price);
});

// CLICK EVENT: Display saved stock entries on click
loadBtn.addEventListener("click", (e) => {
  e.preventDefault();
  clearContainer();

  // Map entry object values
  const entries = loadEntries();
  const mapped = Object.entries(entries).map(([ticker, { price }]) =>
    Stock.fromSaved(ticker, price)
  );
  mapped.forEach((entry) => displayStock(entry, entriesContainer));

  console.log(entries);
});

const clear = document.getElementById("clear");
clear.addEventListener("click", (e) => {
  localStorage.removeItem("entries");
});
