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
  const categoryOptions = document.querySelectorAll(".edit-category-option");
  categoryOptions.forEach((option) => {
    option.addEventListener("click", function () {
      categoryOptions.forEach((o) => o.classList.remove("selected"));
      this.classList.add("selected");
    });
  });

  const paymentOptions = document.querySelectorAll(".edit-payment-option");
  paymentOptions.forEach((option) => {
    option.addEventListener("click", function () {
      paymentOptions.forEach((o) => o.classList.remove("active"));
      this.classList.add("active");
    });
  });

  document
    .querySelector(".cancel-edit-btn")
    .addEventListener("click", function () {
      document.querySelector(".edit-popup-overlay").remove();
    });

  document
    .querySelector(".save-edit-btn")
    .addEventListener("click", function () {
      const index = parseInt(this.dataset.index);
      const name = document.getElementById("edit-name").value;
      const amount = parseFloat(document.getElementById("edit-amount").value);
      const category = document
        .querySelector(".edit-category-option.selected")
        .textContent.toLowerCase();
      const payment = document.querySelector(
        ".edit-payment-option.active"
      ).textContent;

      if (!name || !amount) {
        alert("Please fill in all fields");
        return;
      }

      window.expenses[index] = {
        ...window.expenses[index],
        name,
        amount,
        category,
        payment,
      };

      window.saveExpenses();
      window.renderExpenses();
      window.expenseChart.render(getFilteredExpenses());
      document.querySelector(".edit-popup-overlay").remove();
    });
}
