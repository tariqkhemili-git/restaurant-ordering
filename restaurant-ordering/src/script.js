import menuArray from "./menuArr.js";

// DOM Element References
const menuContainer = document.getElementById("menu-container");
const orderSummaryContainer = document.getElementById("order-summary");
const modal = document.getElementById("order-modal");
const cardNumberValue = document.getElementById("card-number-input");
const payBtn = document.getElementById("pay-btn");
const thankYou = document.querySelector(".thank-you");
const nameInput = document.getElementById("name-input");
const cvvInput = document.getElementById("cvv-input");
const title = document.querySelector(".title");
const subtitle = document.querySelector(".subtitle");

// Application State
let orderPlaced = false; // Tracks if order has been completed to prevent re-ordering
let orderItems = []; // Stores item names (allows duplicates for quantity tracking)

// Format card number input with spaces every 4 digits (e.g., "1234 5678 9012 3456")
cardNumberValue.addEventListener("input", (e) => {
  const formattedValue = e.target.value
    .replace(/\D/g, "") // Remove non-digit characters
    .replace(/(.{4})/g, "$1 ") // Add space after every 4 digits
    .trim();
  e.target.value = formattedValue;
});

title.addEventListener("click", () => {
  location.reload();
});

subtitle.addEventListener("click", () => {
  location.reload();
});

// Restrict CVV input to numbers only
cvvInput.addEventListener("input", (e) => {
  const numericValue = e.target.value.replace(/\D/g, ""); // Remove non-digit characters
  e.target.value = numericValue;
});

// Close modal when clicking outside the form (on backdrop)
document.addEventListener("click", (e) => {
  if (modal.style.visibility === "visible" && e.target === modal) {
    modal.style.visibility = "hidden";
  }
});

/**
 * Event delegation for order summary interactions
 * Handles both "Complete Order" button and individual item removal
 * Using delegation since order summary is dynamically re-rendered
 */
orderSummaryContainer.addEventListener("click", (e) => {
  // Show payment modal when completing order
  if (e.target.classList.contains("complete-order-btn")) {
    if (orderItems.length === 0) return; // Prevent checkout with empty cart
    modal.style.visibility = "visible";
    return;
  }

  // Remove individual items from order
  if (e.target.classList.contains("remove")) {
    const idx = Number(e.target.dataset.index);
    if (!isNaN(idx)) {
      orderItems.splice(idx, 1); // Remove one instance of the item
      renderOrderSummary();
    }
  }
});

/**
 * Renders the menu items from menuArray
 * Only renders if an order hasn't been placed yet
 */
function renderMenu() {
  if (!orderPlaced) {
    menuContainer.innerHTML = menuArray
      .map(
        (item) => `
        <div class="menu-item" data-id="${item.id}">
          <p class="menu-emoji">${item.emoji}</p>
          <div class="menu-inner">
            <h3 class="menu-name">${item.name}</h3>
            <p class="menu-ing">${item.ingredients.join(", ")}</p>
            <p class="menu-price">$${item.price}</p>
          </div>
          <button class="add-to-order-btn"><img src="../plus.svg" alt="Plus icon" /></button>
        </div>
      `,
      )
      .join("");
  }
}

/**
 * Dynamically renders the order summary section
 * Groups duplicate items and shows quantity, calculates total price
 */
function renderOrderSummary() {
  if (!orderSummaryContainer) return;

  // Calculate total price by summing all item prices
  const totalPrice = orderItems.reduce((sum, name) => {
    const found = menuArray.find((item) => item.name === name);
    return found ? sum + found.price : sum;
  }, 0);

  // Group duplicate items and count quantities (e.g., {"Pizza": 2, "Burger": 1})
  const itemCounts = orderItems.reduce((acc, name) => {
    acc[name] = (acc[name] || 0) + 1;
    return acc;
  }, {});

  orderSummaryContainer.innerHTML = orderItems.length
    ? `
        <div class="order-summary-flex">
          <div>
            <h3 class="order-summary-header">Your Order</h3>
            ${Object.entries(itemCounts)
              .map(([item, amount], idx) => {
                const found = menuArray.find((i) => i.name === item);
                const itemPrice = found
                  ? `<p class="order-item-price">$${found.price}</p>`
                  : "";
                return `
                  <div class="order-item-flex">
                    <p class="order-item">${item}</p>
                    <p class="remove" data-index="${orderItems.indexOf(
                      item,
                    )}">remove</p>
                    ${amount > 1 ? `<p class="amount">x${amount}</p>` : ""}
                    ${itemPrice}
                  </div>
                `;
              })
              .join("")}
            <div class="total-flex">
              <p class="order-summary-total">Total</p>
              <p class="order-summary-amount">$${totalPrice}</p>
            </div>
            <button class="complete-order-btn">Complete Order</button>
          </div>
        </div>
      `
    : `
        <div class="order-summary-flex">
          <h3 class="order-summary-header">Your Order</h3>
          <div class="total-flex">
            <p class="order-summary-total">Total</p>
            <p class="order-summary-amount">$0</p>
          </div>
          <button class="complete-order-btn">Complete Order</button>
        </div>
      `;
}

/**
 * Handle payment submission
 * Clears menu and order, shows thank you message, prevents re-ordering
 */
payBtn.addEventListener("click", (e) => {
  if (cvvInput.value && cardNumberValue.value && nameInput.value) {
    e.preventDefault(); // Prevent form submission/page reload

    // Clear the UI
    orderSummaryContainer.innerHTML = "";
    menuContainer.innerHTML = "";
    modal.style.visibility = "hidden";

    // Show success message
    thankYou.textContent = "Thank you for your order!";
    thankYou.style.visibility = "visible";

    orderPlaced = true; // Lock the app to prevent new orders
  }
});

/**
 * Handle adding items to order
 * Uses event delegation to handle clicks on dynamically rendered menu items
 * Finds item by ID and adds to orderItems array
 */
menuContainer.addEventListener("click", (e) => {
  const btn = e.target.closest(".add-to-order-btn");
  if (!btn) return; // Ignore clicks outside add buttons

  const menuItemEl = btn.closest(".menu-item");
  if (!menuItemEl) return;

  // Get item details from data attribute and menu array
  const itemId = Number(menuItemEl.dataset.id);
  const item = menuArray.find((i) => i.id === itemId);
  if (item) orderItems.push(item.name); // Add item name to order

  renderOrderSummary(); // Update order display
});

// Initialize the menu on page load
renderMenu();
