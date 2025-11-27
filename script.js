import menuArray from "./menuArr.js";

const menuContainer = document.getElementById("menu-container");
const orderSummaryContainer = document.getElementById("order-summary");
const modal = document.getElementById("order-modal");
const cardNumberValue = document.getElementById("card-number-input");
const payBtn = document.getElementById("pay-btn");
const thankYou = document.querySelector(".thank-you");

let orderItems = [];

cardNumberValue.addEventListener("input", (e) => {
  const formattedValue = e.target.value
    .replace(/\D/g, "")
    .replace(/(.{4})/g, "$1 ")
    .trim();
  e.target.value = formattedValue;
});

document.addEventListener("click", (e) => {
  if (modal.style.visibility === "visible" && e.target === modal) {
    modal.style.visibility = "hidden";
  }
});

// Remove static event listener for orderBtn

// Event delegation for dynamically rendered Complete Order button
orderSummaryContainer.addEventListener("click", (e) => {
  if (e.target.classList.contains("complete-order-btn")) {
    if (orderItems.length === 0) return;
    modal.style.visibility = "visible";
    return;
  }
  if (e.target.classList.contains("remove")) {
    const idx = Number(e.target.dataset.index);
    if (!isNaN(idx)) {
      orderItems.splice(idx, 1);
      renderOrderSummary();
    }
  }
});

function renderMenu() {
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
          <button class="add-to-order-btn"><img src="assets/plus.svg" alt="Plus icon" /></button>
        </div>
      `
    )
    .join("");
}

function renderOrderSummary() {
  if (!orderSummaryContainer) return;

  // Calculate total price by summing prices of items in orderItems
  const totalPrice = orderItems.reduce((sum, name) => {
    const found = menuArray.find((item) => item.name === name);
    return found ? sum + found.price : sum;
  }, 0);

  // Build a summary of unique items and their counts
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
                      item
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

payBtn.addEventListener("click", (e) => {
  e.preventDefault(); // Prevent form reload
  // Clear order summary content so thank you message is not overlapped
  orderSummaryContainer.innerHTML = "";
  modal.style.visibility = "hidden";
  thankYou.textContent = "Thank you for your order!";
  thankYou.style.visibility = "visible";
});

menuContainer.addEventListener("click", (e) => {
  const btn = e.target.closest(".add-to-order-btn");
  if (!btn) return;

  const menuItemEl = btn.closest(".menu-item");
  if (!menuItemEl) return;

  const itemId = Number(menuItemEl.dataset.id);
  const item = menuArray.find((i) => i.id === itemId);
  if (item) orderItems.push(item.name);

  renderOrderSummary();
});

// Remove duplicate event delegation for remove buttons

renderMenu();
