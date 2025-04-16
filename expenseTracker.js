document.addEventListener("DOMContentLoaded", function () {
  // Make variables global
  window.expenses = JSON.parse(localStorage.getItem("expenses")) || [];
  window.currentFilter = "All Categories";

  // DOM elements
  const expenseForm = document.getElementById("expense-form");
  const expenseName = document.getElementById("expense-name");
  const expenseAmount = document.getElementById("expense-amount");
  const addExpenseBtn = document.querySelector(".add-expense-btn");
  const categoryPills = document.querySelectorAll(".category-pill");
  const paymentOptions = document.querySelectorAll(".payment-option");
  const clearAllBtn = document.querySelector(".clear-all-btn");
  const filterDropdown = document.querySelector(".filter-dropdown");
  const customCategoryPill = document.querySelector(".category-pill.custom");
  const expensesList = document.querySelector(".expenses-list");
  const ctx = document.getElementById("expenseChart").getContext("2d");

  // State variables
  let selectedCategory = "food";
  let selectedPayment = "UPI";
  let usedCategories = new Set();
  window.expenseChart = new ExpenseChart(ctx);

  // Initialize app
  function init() {
    renderExpenses();
    setupEventListeners();
    window.expenses.forEach((expense) => usedCategories.add(expense.category));
    updateCategoryDropdown();
    categoryPills[0].classList.add("selected");
    window.expenseChart.init(getFilteredExpenses());
  }

  // Set up event listeners
  function setupEventListeners() {
    categoryPills.forEach((pill) => {
      if (!pill.classList.contains("custom")) {
        pill.addEventListener("click", function () {
          categoryPills.forEach((p) => p.classList.remove("selected"));
          this.classList.add("selected");
          selectedCategory = this.textContent.toLowerCase();
          document.querySelector(".custom-category-input")?.remove();
        });
      }
    });

    customCategoryPill.addEventListener("click", function () {
      const existingCustomInput = document.querySelector(
        ".custom-category-input"
      );
      if (existingCustomInput) return existingCustomInput.remove();

      categoryPills.forEach((p) => p.classList.remove("selected"));
      this.classList.add("selected");

      const customInput = document.createElement("div");
      customInput.className = "custom-category-input";
      customInput.innerHTML = `
    <input type="text" placeholder="Category name" class="custom-category-text">
    <button class="custom-category-add">Add</button>
  `;

      document.querySelector(".category-container").after(customInput);
      document.querySelector(".custom-category-text").focus();

      document
        .querySelector(".custom-category-add")
        .addEventListener("click", addCustomCategory);
      document
        .querySelector(".custom-category-text")
        .addEventListener("keypress", (e) => {
          if (e.key === "Enter") {
            addCustomCategory();
          }
        });

      function addCustomCategory() {
        const customCategory = document
          .querySelector(".custom-category-text")
          .value.trim();
        if (!customCategory) return;

        // Create new category pill
        const newCategoryPill = document.createElement("div");
        newCategoryPill.className = `category-pill custom-added`;
        newCategoryPill.textContent = customCategory;
        newCategoryPill.style.backgroundColor = getRandomColor();

        // Insert before the Custom pill
        const customPill = document.querySelector(".category-pill.custom");
        customPill.parentNode.insertBefore(newCategoryPill, customPill);

        // Add click handler
        newCategoryPill.addEventListener("click", function () {
          categoryPills.forEach((p) => p.classList.remove("selected"));
          this.classList.add("selected");
          selectedCategory = customCategory.toLowerCase();
          document.querySelector(".custom-category-input")?.remove();
        });

        selectedCategory = customCategory.toLowerCase();
        customInput.remove();
        usedCategories.add(customCategory.toLowerCase());
        updateCategoryDropdown();
      }
    });

    function getRandomColor(category) {
      const categoryColors = {
        food: "#6366f1",
        travel: "#f59e0b",
        shopping: "#10b981",
        home: "#8b5cf6",
        other: "#ef4444",
        custom: "#64748b",
      };
      return categoryColors[category] || "#64748b"; // Default to custom color
    }

    paymentOptions.forEach((option) => {
      option.addEventListener("click", function () {
        paymentOptions.forEach((o) => o.classList.remove("active"));
        this.classList.add("active");
        selectedPayment = this.textContent;
      });
    });

    addExpenseBtn.addEventListener("click", addExpense);
    clearAllBtn.addEventListener("click", clearAllExpenses);
    filterDropdown.addEventListener("change", function () {
      window.currentFilter = this.value;
      renderExpenses();
      window.expenseChart.render(getFilteredExpenses());
    });
  }

  // Expense functions
  function addExpense(e) {
    e.preventDefault();
    if (!expenseName.value || !expenseAmount.value)
      return alert("Please fill in all fields");

    const expense = {
      name: expenseName.value,
      amount: parseFloat(expenseAmount.value),
      category: selectedCategory,
      payment: selectedPayment,
      date: new Date().toISOString(),
    };

    window.expenses.push(expense);
    usedCategories.add(selectedCategory);
    window.saveExpenses();
    renderExpenses();
    updateCategoryDropdown();
    window.expenseChart.render(getFilteredExpenses());

    expenseName.value = "";
    expenseAmount.value = "";
  }

  function deleteExpense(index) {
    if (!confirm("Are you sure you want to delete this expense?")) return;

    const deletedCategory = window.expenses[index].category;
    window.expenses.splice(index, 1);
    window.saveExpenses();
    renderExpenses();
    window.expenseChart.render(getFilteredExpenses());

    if (
      !window.expenses.some((expense) => expense.category === deletedCategory)
    ) {
      usedCategories.delete(deletedCategory);
      updateCategoryDropdown();
    }
  }

  function clearAllExpenses() {
    if (!confirm("Are you sure you want to clear all expenses?")) return;
    window.expenses = [];
    usedCategories.clear();
    window.saveExpenses();
    renderExpenses();
    updateCategoryDropdown();
    window.expenseChart.render(getFilteredExpenses());
  }

  window.saveExpenses = function () {
    localStorage.setItem("expenses", JSON.stringify(window.expenses));
  };

  // Rendering functions
  window.renderExpenses = function () {
    expensesList.innerHTML = "";

    const filteredExpenses = getFilteredExpenses();
    const filteredTotal = filteredExpenses.reduce(
      (sum, expense) => sum + expense.amount,
      0
    );
    document.querySelector(
      ".summary-amount"
    ).textContent = `₹${filteredTotal.toFixed(2)}`;

    filteredExpenses.sort((a, b) => new Date(b.date) - new Date(a.date));

    if (filteredExpenses.length === 0) {
      const noExpensesMsg = document.createElement("div");
      noExpensesMsg.className = "no-expenses-message";
      noExpensesMsg.textContent =
        window.currentFilter !== "All Categories"
          ? `No expenses found in ${window.currentFilter} category.`
          : "No expenses found. Add your first expense!";
      return expensesList.appendChild(noExpensesMsg);
    }

    filteredExpenses.forEach((expense, displayIndex) => {
      const realIndex = window.expenses.findIndex(
        (e) => e.date === expense.date && e.name === expense.name
      );
      const expenseItem = document.createElement("div");
      expenseItem.className = "expense-item";
      expenseItem.dataset.index = realIndex;

      const expenseDate = new Date(expense.date);
      const dateText = getFormattedDate(expenseDate);
      const formattedTime = getFormattedTime(expenseDate);
      const categoryClass = [
        "food",
        "travel",
        "shopping",
        "home",
        "other",
      ].includes(expense.category)
        ? expense.category
        : "custom";

      expenseItem.innerHTML = `
        <div class="expense-item-header">
          <div class="expense-name">${expense.name}</div>
          <div class="expense-date">${dateText}, ${formattedTime}</div>
        </div>
        <div class="expense-amount">₹${expense.amount.toFixed(2)}</div>
        <div class="expense-details">
          <div class="expense-category-tag ${categoryClass}">${
        expense.category
      }</div>
          <div class="expense-payment">via ${expense.payment}</div>
        </div>
        <div class="expense-actions">
          <button class="action-btn edit-btn">✏️</button>
          <button class="action-btn delete-btn">🗑️</button>
        </div>
      `;

      expenseItem
        .querySelector(".delete-btn")
        .addEventListener("click", () => deleteExpense(realIndex));
      expenseItem
        .querySelector(".edit-btn")
        .addEventListener("click", () => window.showEditPopup(realIndex));
      expensesList.appendChild(expenseItem);
    });
  };

  function getFilteredExpenses() {
    return window.currentFilter === "All Categories"
      ? window.expenses
      : window.expenses.filter(
          (expense) =>
            expense.category.toLowerCase() ===
            window.currentFilter.toLowerCase()
        );
  }

  // Helper functions
  function getFormattedDate(date) {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return "Today";
    if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
    return date.toLocaleDateString();
  }

  function getFormattedTime(date) {
    let hours = date.getHours();
    let minutes = date.getMinutes();
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;
    minutes = minutes.toString().padStart(2, "0");
    return `${hours}:${minutes} ${ampm}`;
  }

  function updateCategoryDropdown() {
    filterDropdown.innerHTML = `<option>All Categories</option>`;
    usedCategories.forEach((category) => {
      const option = document.createElement("option");
      option.textContent = category.charAt(0).toUpperCase() + category.slice(1);
      filterDropdown.appendChild(option);
    });
  }

  init();
});
