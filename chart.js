class ExpenseChart {
  constructor(ctx) {
    this.ctx = ctx;
    this.chart = null;
  }

  init(expenses) {
    this.render(expenses);
  }

  render(expenses) {
    // 1. Get stored colors from localStorage (CRITICAL CHANGE)
    const storedColors = JSON.parse(localStorage.getItem("categoryColors")) || {
      // Default fallbacks if nothing in storage
      food: "#6366f1",
      travel: "#f59e0b",
      shopping: "#10b981",
      home: "#8b5cf6",
      clothing: "#ef4444",
    };

    // 2. Calculate category totals
    const categoryData = {};
    expenses.forEach((expense) => {
      const categoryKey = expense.category.toLowerCase(); // Ensure case consistency
      categoryData[categoryKey] =
        (categoryData[categoryKey] || 0) + expense.amount;
    });

    // 3. Prepare chart data with dynamic colors
    const categories = Object.keys(categoryData);
    const colors = categories.map(
      (category) => storedColors[category] || "#64748b" // Fallback to grey if no color
    );

    // 4. Destroy and recreate chart
    if (this.chart) this.chart.destroy();

    this.chart = new Chart(this.ctx, {
      type: "pie",
      data: {
        labels: categories,
        datasets: [
          {
            data: Object.values(categoryData),
            backgroundColor: colors,
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "right",
          },
          tooltip: {
            callbacks: {
              label: function (context) {
                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                const value = context.raw;
                const percentage = Math.round((value / total) * 100);
                return `${context.label}: ₹${value.toFixed(
                  2
                )} (${percentage}%)`;
              },
            },
          },
        },
      },
    });
  }
}
console.log(
  "Stored colors:",
  JSON.parse(localStorage.getItem("categoryColors"))
);
console.log(
  "Generated colors:",
  Object.keys(categoryData).map(
    (category) => storedColors[category] || "#64748b"
  )
);
