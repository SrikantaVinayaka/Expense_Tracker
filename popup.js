// Make expenses array and functions global
expenses = JSON.parse(localStorage.getItem("expenses")) || [];
saveExpenses = function () {
  localStorage.setItem("expenses", JSON.stringify(expenses));
};

function getFilteredExpenses() {
  return window.currentFilter === "All Categories"
    ? window.expenses
    : window.expenses.filter(
        (expense) =>
          expense.category.toLowerCase() === window.currentFilter.toLowerCase()
      );
}

function getCategoryOptions(selected) {
  const categories = ["food", "travel", "shopping", "home", "clothing"];
  let optionsHTML = "";

  categories.forEach((category) => {
    optionsHTML += `<div class="edit-category-option ${category} ${
      category === selected ? "selected" : ""
    }">${category}</div>`;
  });

  if (selected && !categories.includes(selected)) {
    optionsHTML += `<div class="edit-category-option custom selected">${selected}</div>`;
  }

  return optionsHTML;
}

window.showEditPopup = function (index) {
  const expense = window.expenses[index];

  const overlay = document.createElement("div");
  overlay.className = "edit-popup-overlay";

  const popup = document.createElement("div");
  popup.className = "edit-popup";
  popup.innerHTML = `
        <h3 class="edit-exp">Edit Expense</h3>
        <div class="edit-form">
            <div class="form-group">
                <label for="edit-name" class="form-label">Expense Name</label>
                <input type="text" id="edit-name" class="form-input" value="${
                  expense.name
                }" required>
            </div>
            <div class="form-group">
                <label for="edit-amount" class="form-label">Amount</label>
                <input type="number" id="edit-amount" class="form-input" value="${
                  expense.amount
                }" min="0" step="0.01" required>
            </div>
            <div class="form-group">
                <label class="form-label">Category</label>
                <div class="edit-category-container">
                    ${getCategoryOptions(expense.category)}
                </div>
            </div>
            <div class="form-group">
                <label class="form-label">Payment Method</label>
                <div class="edit-payment-options">
                    <div class="edit-payment-option ${
                      expense.payment === "UPI" ? "active" : ""
                    }">UPI</div>
                    <div class="edit-payment-option ${
                      expense.payment === "Cash" ? "active" : ""
                    }">Cash</div>
                    <div class="edit-payment-option ${
                      expense.payment === "Card" ? "active" : ""
                    }">Card</div>
                </div>
            </div>
            <div class="form-grp1">
            <div class="form-group">
                <label for="edit-date" class="form-label">Date</label>
                <input type="date" id="edit-date" class="form-input" value="${
                  new Date(expense.date).toISOString().split("T")[0]
                }" required>
            </div>
            <div class="form-group">
                <label for="edit-time" class="form-label">Time</label>
                <input type="time" id="edit-time" class="form-input" 
                value="${new Date(expense.date)
                  .toLocaleTimeString("en-GB", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
                  })
                  .replace("24:", "00:")}" required>
            </div>
            </div>

            <div class="popup-actions">
                <button class="cancel-edit-btn">Cancel</button>
                <button class="save-edit-btn" data-index="${index}">Save</button>
            </div>
        </div>
    `;

  overlay.appendChild(popup);
  document.body.appendChild(overlay);

  setupPopupEventListeners();
};

function setupPopupEventListeners() {
  const saveEditBtn = document.querySelector(".save-edit-btn");
  const cancelEditBtn = document.querySelector(".cancel-edit-btn");

  saveEditBtn.addEventListener("click", function () {
    const index = parseInt(this.dataset.index, 10);
    const name = document.getElementById("edit-name").value.trim();
    const amount = parseFloat(document.getElementById("edit-amount").value);
    const category = document
      .querySelector(".edit-category-option.selected")
      .textContent.trim();
    const payment = document
      .querySelector(".edit-payment-option.active")
      .textContent.trim();
    const date = document.getElementById("edit-date").value;
    const time = document.getElementById("edit-time").value;

    if (!name || isNaN(amount) || !date || !time) {
      alert("Please fill in all fields.");
      return;
    }

    // Update the expense
    window.expenses[index] = {
      ...window.expenses[index],
      name,
      amount,
      category,
      payment,
      date: new Date(`${date}T${time}`).toISOString(),
    };

    // Save to localStorage and update UI
    window.saveExpenses();
    window.renderExpenses();
    window.expenseChart.render(getFilteredExpenses());

    // Close the popup
    document.querySelector(".edit-popup-overlay").remove();
  });

  cancelEditBtn.addEventListener("click", function () {
    document.querySelector(".edit-popup-overlay").remove();
  });

  // Add event listeners for category and payment selection
  document.querySelectorAll(".edit-category-option").forEach((option) => {
    option.addEventListener("click", function () {
      document
        .querySelectorAll(".edit-category-option")
        .forEach((o) => o.classList.remove("selected"));
      this.classList.add("selected");
    });
  });

  document.querySelectorAll(".edit-payment-option").forEach((option) => {
    option.addEventListener("click", function () {
      document
        .querySelectorAll(".edit-payment-option")
        .forEach((o) => o.classList.remove("active"));
      this.classList.add("active");
    });
  });
}
