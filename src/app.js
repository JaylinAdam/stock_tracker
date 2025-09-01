import { Stock } from "./models/Stock.js";

// CONSTANTS
const input = document.getElementById("search-input");
const priceBtn = document.getElementById("price-button");
const saveBtn = document.getElementById("save-button");
const loadBtn = document.getElementById("load-button");
const reminderBtn = document.getElementById("quote-reminder-button");
const outputList = document.getElementById("quote-output-list");
const savedList = document.getElementById("quote-saved-list");
const savedContainer = document.getElementById("saved-container");
const alertList = document.getElementById("alert-list");
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
  const stockEl = document.createElement("div");

  // Store display output
  stockEl.innerHTML = stock.display();

  // `Appe`nd element to container
  container.appendChild(stockEl);
}

function displayAlert(message) {
  alertList.innerHTML = `<p>${message}<p>`;
}

function clearContent() {
  // Clear previous content
  const list = [outputList, savedList, alertList];
  const actives = [savedContainer, reminderBtn];
  list.forEach((item) => {
    item.innerHTML = "";
  });
  actives.forEach((item) => {
    item.classList.remove("active");
  });
}

// Prevent multiple concurrent fetches
let loading = false;
// CLICK EVENT: Check stock entry on click
priceBtn.addEventListener("click", async (e) => {
  e.preventDefault();

  // If input is empty
  const ticker = input.value.trim();
  if (ticker === "") {
    displayAlert("Please enter a ticker.");
    return;
  }

  if (loading) return;
  loading = true;
  priceBtn.disabled = true;
  try {
    // Declare stock object and retrieve data from API
    const stock = await Stock.fromTicker(ticker);

    // If price exists
    if (stock.price) {
      clearContent();
      displayStock(stock, outputList);

      // Display reminder button
      reminderBtn.classList.add("active");

      // Store dataset to be saved
      saveBtn.dataset.ticker = stock.ticker;
      saveBtn.dataset.price = stock.price;
    } else {
      displayAlert("Could not fetch price. Please check ticker symbol");
    }
  } catch {
    throw new Error("Failed to fetch price during loading. Please try again.");
  } finally {
    loading = false;
    priceBtn.disabled = false;
    input.value = "";
  }
});

//CLICK EVENT: Save stock entry on click
saveBtn.addEventListener("click", (e) => {
  e.preventDefault();

  // If input is empty
  if (!e.target.dataset.ticker) {
    displayAlert("There is no entry to be saved. Please enter a ticker.");
    return;
  }

  const { ticker, price } = e.target.dataset;
  addEntry(ticker, price);
  displayAlert("Entry saved!");
});

// CLICK EVENT: Display saved stock entries on click
loadBtn.addEventListener("click", (e) => {
  e.preventDefault();

  // Map entry object values
  const entries = loadEntries();
  const mapped = Object.entries(entries).map(([ticker, { price }]) =>
    Stock.fromSaved(ticker, price)
  );
  if (mapped.length === 0) {
    displayAlert("No saved entries.");
  } else {
    clearContent();
    savedContainer.classList.add("active");
    mapped.forEach((entry) => displayStock(entry, savedList));
  }

  console.log(entries);
});

const clearEntries = document.getElementById("clear-entries");
clearEntries.addEventListener("click", (e) => {
  localStorage.removeItem("entries");
});
const clearScreen = document.getElementById("clear-screen");
clearScreen.addEventListener("click", (e) => {
  clearContent();
});
