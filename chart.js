class ExpenseChart {
  constructor(ctx) {
    this.ctx = ctx;
    this.chart = null;
  }

  init(expenses) {
    this.render(expenses);
  }

  render(expenses) {
    const categoryData = {};
    const categoryColors = {
      food: "#6366f1",
      travel: "#f59e0b",
      shopping: "#10b981",
      home: "#8b5cf6",
      other: "#ef4444",
      custom: "#64748b",
    };

    expenses.forEach((expense) => {
      categoryData[expense.category] =
        (categoryData[expense.category] || 0) + expense.amount;
    });

    const categories = Object.keys(categoryData);
    const amounts = Object.values(categoryData);
    const colors = categories.map(
      (category) => categoryColors[category] || "#64748b"
    );

    if (this.chart) this.chart.destroy();

    this.chart = new Chart(this.ctx, {
      type: "pie",
      data: {
        labels: categories,
        datasets: [
          {
            data: amounts,
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

  destroy() {
    if (this.chart) {
      this.chart.destroy();
      this.chart = null;
    }
  }
}
