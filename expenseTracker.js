document.addEventListener("DOMContentLoaded", function () {
  // Make variables global
  window.expenses = JSON.parse(localStorage.getItem("expenses")) || [];
  window.currentFilter = "All Categories";
  window.categoryColors = JSON.parse(
    localStorage.getItem("categoryColors")
  ) || {
    food: "#6366f1",
    travel: "#f59e0b",
    shopping: "#10b981",
    home: "#8b5cf6",
    clothing: "#ef4444",
  };

  // DOM elements
  const expenseName = document.getElementById("expense-name");
  const expenseAmount = document.getElementById("expense-amount");
  const addExpenseBtn = document.querySelector(".add-expense-btn");
  const categoryPills = document.querySelectorAll(".category-pill");
  const paymentOptions = document.querySelectorAll(".payment-option");
  const clearAllBtn = document.querySelector(".clear-all-btn");
  const filterDropdown = document.querySelector(".filter-dropdown");
  const expensesList = document.querySelector(".expenses-list");
  const ctx = document.getElementById("expenseChart").getContext("2d");
  const timeFilterDropdown = document.querySelector(".time-filter-dropdown");
  const sortFilterDropdown = document.querySelector(".sort-filter-dropdown");

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
    document.querySelectorAll(".category-pill").forEach((pill) => {
      const category = pill.textContent.toLowerCase();
      pill.style.backgroundColor = window.categoryColors[category] || "#64748b";
    });
  }

  // Set up event listeners
  function setupEventListeners() {
    // Handle category selection
    document
      .querySelector(".category-container")
      .addEventListener("click", (e) => {
        const pill = e.target.closest(".category-pill");
        if (!pill) return;

        // Deselect all pills
        document
          .querySelectorAll(".category-pill")
          .forEach((p) => p.classList.remove("selected"));

        // Select clicked pill
        pill.classList.add("selected");
        selectedCategory = pill.textContent.toLowerCase();

        // Handle custom category
        if (pill.classList.contains("custom")) {
          handleCustomCategory();
        } else {
          document.querySelector(".custom-category-input")?.remove();
        }
      });

    // Payment method selection
    paymentOptions.forEach((option) => {
      option.addEventListener("click", function () {
        paymentOptions.forEach((o) => o.classList.remove("active"));
        this.classList.add("active");
        selectedPayment = this.textContent;
      });
    });

    // Other event listeners
    addExpenseBtn.addEventListener("click", addExpense);
    clearAllBtn.addEventListener("click", clearAllExpenses);
    filterDropdown.addEventListener("change", function () {
      window.currentFilter = this.value;
      renderExpenses();
      window.expenseChart.render(getFilteredExpenses());
    });
    timeFilterDropdown.addEventListener("change", function () {
      renderExpenses();
      window.expenseChart.render(getFilteredExpenses());
    });
    sortFilterDropdown.addEventListener("change", renderExpenses);
  }

  // Handle custom category creation
  function handleCustomCategory() {
    const existingInput = document.querySelector(".custom-category-input");
    if (existingInput) return existingInput.remove();

    const customInput = document.createElement("div");
    customInput.className = "custom-category-input";
    customInput.innerHTML = `
      <input type="text" placeholder="Category name" class="custom-category-text">
      <button class="custom-category-add">Add</button>
    `;

    document.querySelector(".category-container").after(customInput);

    // Focus input field
    customInput.querySelector(".custom-category-text").focus();

    // Set up event listeners for the Add button
    customInput
      .querySelector(".custom-category-add")
      .addEventListener("click", addCustomCategory);
    customInput
      .querySelector(".custom-category-text")
      .addEventListener("keypress", (e) => {
        if (e.key === "Enter") addCustomCategory();
      });
  }

  // Add custom category
  function addCustomCategory() {
    const customCategory = document
      .querySelector(".custom-category-text")
      .value.trim()
      .toLowerCase();
    if (!customCategory) return;

    const categoryKey = customCategory.toLowerCase();
    const color = getColorForCategory(categoryKey);

    // Create new pill
    const newCategoryPill = document.createElement("div");
    newCategoryPill.className = "category-pill";
    newCategoryPill.textContent = customCategory;
    newCategoryPill.style.backgroundColor = color;

    // Insert before custom pill
    const customPill = document.querySelector(".category-pill.custom");
    customPill.parentNode.insertBefore(newCategoryPill, customPill);

    // Set up click handler
    newCategoryPill.addEventListener("click", function () {
      deselectAllPills();
      this.classList.add("selected");
      selectedCategory = categoryKey;
      document.querySelector(".custom-category-input")?.remove();
    });

    // Update state
    selectedCategory = categoryKey;
    usedCategories.add(categoryKey);
    updateCategoryDropdown();
    localStorage.setItem(
      "categoryColors",
      JSON.stringify(window.categoryColors)
    );
    document.querySelector(".custom-category-input").remove();
    window.expenseChart.render(window.expenses);
  }

  // Helper function to deselect all pills
  function deselectAllPills() {
    document
      .querySelectorAll(".category-pill")
      .forEach((p) => p.classList.remove("selected"));
  }

  // Get color for category
  function getColorForCategory(category) {
    if (!window.categoryColors[category]) {
      const hue = Math.floor(Math.random() * 360);
      window.categoryColors[category] = `hsl(${hue}, 70%, 60%)`;
      localStorage.setItem(
        "categoryColors",
        JSON.stringify(window.categoryColors)
      );
    }
    return window.categoryColors[category];
  }
  // Expense functions
  // Modify the addExpense() function:
  function addExpense(e) {
    e.preventDefault();

    // Validate inputs & amt
    if (!expenseName.value || !expenseAmount.value) {
      return alert("Please fill in all fields");
    }

    if (expenseAmount.value <= 0) {
      alert("Amount must be greater than 0");
      return;
    }

    // Create and save expense
    const expense = {
      name: expenseName.value,
      amount: parseFloat(expenseAmount.value),
      category: selectedCategory,
      payment: selectedPayment,
      date: new Date().toISOString(),
    };

    window.expenses.push(expense);
    window.saveExpenses();

    // RESET THE LEFT PANEL HERE
    resetLeftPanel();

    // Update UI
    renderExpenses();
    window.expenseChart.render(getFilteredExpenses());
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

  function resetLeftPanel() {
    // Clear input fields
    expenseName.value = "";
    expenseAmount.value = "";

    // Resetting category selection to "Food"
    deselectAllPills();

    document.querySelector(".category-pill.food").classList.add("selected");
    selectedCategory = "food";

    // Reset payment method to "UPI" (first option)
    document.querySelectorAll(".payment-option").forEach((option) => {
      option.classList.remove("active");
    });
    document.querySelector(".payment-option").classList.add("active");
    selectedPayment = "UPI";

    // Remove any custom category input if present
    document.querySelector(".custom-category-input")?.remove();

    // Focus on name field for next entry
    expenseName.focus();
  }

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
      const categoryClass = ["food", "travel", "shopping", "home", "clothing"]
        ? // .includes(expense.category)
          expense.category
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
          <button class="action-btn edit-btn"><img src="images/edit.png" alt="edit" /></button>
          <button class="action-btn delete-btn"><img src="images/delete.png" alt="delete" /></button>
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
    const now = new Date();
    const timeFilter = timeFilterDropdown.value;
    const sortOption = sortFilterDropdown.value;

    // Step 1: Filter by time
    let filteredExpenses = [...window.expenses];
    if (timeFilter !== "all-time") {
      let startDate = new Date();
      let endDate = new Date();

      switch (timeFilter) {
        case "week": // Last complete week (Mon-Sun)
          const today = new now();
          const dayOfWeek = today.getDay(); // 0 (Sun) to 6 (Sat)
          const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Days since Monday
          startDate = new Date(today.setDate(today.getDate() - diff - 7)); // Previous Monday
          endDate = new Date(startDate);
          endDate.setDate(startDate.getDate() + 6); // Following Sunday
          break;

        case "month": // Last complete month
          startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
          endDate = new Date(now.getFullYear(), now.getMonth(), 0);
          break;

        case "3-months": // Last 3 complete months
          startDate = new Date(now.getFullYear(), now.getMonth() - 3, 1);
          endDate = new Date(now.getFullYear(), now.getMonth(), 0);
          break;

        case "6-months": // Last 6 complete months
          startDate = new Date(now.getFullYear(), now.getMonth() - 6, 1);
          endDate = new Date(now.getFullYear(), now.getMonth(), 0);
          break;

        case "year": // Last complete year
          startDate = new Date(now.getFullYear() - 1, 0, 1);
          endDate = new Date(now.getFullYear() - 1, 11, 31);
          break;
      }

      // Set time components to cover entire days
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);

      filteredExpenses = filteredExpenses.filter((expense) => {
        const expenseDate = new Date(expense.date);
        return expenseDate >= startDate && expenseDate <= endDate;
      });
    }
    // Step 2: Filter by category
    if (window.currentFilter !== "All Categories") {
      filteredExpenses = filteredExpenses.filter(
        (expense) =>
          expense.category.toLowerCase() === window.currentFilter.toLowerCase()
      );
    }

    // Step 3: Sort by selected option
    if (sortOption === "date-desc") {
      filteredExpenses.sort((a, b) => new Date(b.date) - new Date(a.date));
    } else if (sortOption === "date-asc") {
      filteredExpenses.sort((a, b) => new Date(a.date) - new Date(b.date));
    } else if (sortOption === "price-desc") {
      filteredExpenses.sort((a, b) => b.amount - a.amount);
    } else if (sortOption === "price-asc") {
      filteredExpenses.sort((a, b) => a.amount - b.amount);
    }

    return filteredExpenses;
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
