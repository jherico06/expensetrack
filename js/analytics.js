/* ============================================================
   analytics.js
   Financial analytics – aggregations, rule-based insights
   and Chart.js wrappers (doughnut / bar / line)
   ============================================================ */

const Analytics = (() => {

  const PALETTE = [
    "#7c5cff", "#22d3ee", "#34d399", "#fb7185", "#fbbf24",
    "#60a5fa", "#f472b6", "#a3e635", "#38bdf8", "#fb923c", "#94a3b8"
  ];

  const chartInstances = {};

  /* ---------- HELPERS ---------- */

  function transactionsForMonth(transactions, year, month) {
    const { start, end } = Utils.monthRange(year, month);
    return transactions.filter(t => t.date >= start && t.date <= end);
  }

  function categoryColor(categoryName) {
    const tracker = ExpenseTracker.getInstance();
    const categories = tracker.getCategories();
    const index = categories.findIndex(c => c.name === categoryName);
    if (index >= 0) return PALETTE[index % PALETTE.length];

    let hash = 0;
    for (let i = 0; i < categoryName.length; i++) {
      hash = categoryName.charCodeAt(i) + ((hash << 5) - hash);
    }
    return PALETTE[Math.abs(hash) % PALETTE.length];
  }

  // [{ name, total, count, pct }]
  function categoryBreakdown(transactions) {
    const tracker = ExpenseTracker.getInstance();
    const totals = tracker.calculateCategoryTotals(transactions);
    const grandTotal = totals.reduce((sum, item) => sum + item.total, 0);

    return totals.map(item => ({
      ...item,
      pct: grandTotal ? Math.round((item.total / grandTotal) * 100) : 0,
      color: categoryColor(item.name)
    }));
  }

  // last N months (ending on the selected month) with income/expense totals
  function monthlySeries(transactions, year, month, count = 6) {
    const series = [];
    for (let i = count - 1; i >= 0; i--) {
      const date = new Date(year, month - i, 1);
      const list = transactionsForMonth(transactions, date.getFullYear(), date.getMonth());
      const tracker = ExpenseTracker.getInstance();
      series.push({
        key: Utils.monthKey(date.getFullYear(), date.getMonth()),
        label: Utils.monthName(date.getMonth()).slice(0, 3),
        fullLabel: Utils.monthLabel(date.getFullYear(), date.getMonth()),
        income: tracker.calculateIncome(list),
        expense: tracker.calculateExpenses(list)
      });
    }
    return series;
  }

  // daily spending inside one month -> [{ day, total }]
  function dailySeries(transactions, year, month) {
    const list = transactionsForMonth(transactions, year, month);
    const days = Utils.daysInMonth(year, month);
    const totals = new Array(days).fill(0);

    list
      .filter(t => t.type === "expense")
      .forEach(t => {
        const day = Number(t.date.slice(8, 10));
        if (day >= 1 && day <= days) totals[day - 1] += t.amount;
      });

    return totals.map((total, index) => ({ day: index + 1, total }));
  }

  function monthStats(transactions, year, month) {
    const tracker = ExpenseTracker.getInstance();
    const list = transactionsForMonth(transactions, year, month);
    const incomeList = list.filter(t => t.type === "income");
    const expenseList = list.filter(t => t.type === "expense");

    const largestIncome = incomeList.length
      ? incomeList.reduce((max, t) => (t.amount > max.amount ? t : max), incomeList[0])
      : null;

    const highestExpense = expenseList.length
      ? expenseList.reduce((max, t) => (t.amount > max.amount ? t : max), expenseList[0])
      : null;

    return {
      list,
      income: tracker.calculateIncome(list),
      expenses: tracker.calculateExpenses(list),
      balance: tracker.calculateBalance(list),
      incomeCount: incomeList.length,
      expenseCount: expenseList.length,
      largestIncome,
      highestExpense,
      averageExpense: expenseList.length
        ? tracker.calculateExpenses(list) / expenseList.length
        : 0
    };
  }

  /* ---------- RULE-BASED FINANCIAL INSIGHTS (no AI) ---------- */

  function generateInsights(year, month) {
    const tracker = ExpenseTracker.getInstance();
    const transactions = tracker.getTransactions();
    const stats = monthStats(transactions, year, month);
    const insights = [];

    const previous = Utils.shiftMonth(year, month, -1);
    const prevStats = monthStats(transactions, previous.year, previous.month);

    if (!stats.list.length) {
      insights.push({
        tone: "info",
        icon: "icon-bulb",
        text: `No activity recorded for ${Utils.monthLabel(year, month)} yet. Add a transaction to start the analysis.`
      });
      return insights;
    }

    const breakdown = categoryBreakdown(stats.list);

    // top category share
    if (stats.expenses > 0 && breakdown.length) {
      const top = breakdown[0];
      insights.push({
        tone: "info",
        icon: "icon-pie",
        text: `You spent ${top.pct}% of your monthly expenses on ${top.name} (${Utils.formatWhole(top.total)}).`
      });
    }

    // highest category statement
    if (breakdown.length >= 1 && stats.expenses > 0) {
      insights.push({
        tone: "info",
        icon: "icon-chart",
        text: `${breakdown[0].name} is your highest expense category for ${Utils.monthName(month)}.`
      });
    }

    // monthly budget usage
    const monthKeyValue = Utils.monthKey(year, month);
    const monthlyBudget = tracker.getMonthlyBudget(monthKeyValue);
    if (monthlyBudget) {
      const used = tracker.calculateBudgetUsage(monthlyBudget.limit, stats.expenses);
      const remaining = monthlyBudget.limit - stats.expenses;

      if (used >= 100) {
        insights.push({
          tone: "warn",
          icon: "icon-alert",
          text: `You have exceeded your monthly budget by ${Utils.formatWhole(Math.abs(remaining))}.`
        });
      } else {
        insights.push({ tone: "info", icon: "icon-wallet", text: `You have used ${used}% of your monthly budget.` });
        if (used < 80) {
          insights.push({
            tone: "good",
            icon: "icon-check",
            text: `You still have ${Utils.formatWhole(remaining)} remaining in your monthly budget.`
          });
        }
      }
    }

    // category budgets exceeded / close to limit
    tracker.getCategoryBudgets(monthKeyValue).forEach(budget => {
      const spent = stats.list
        .filter(t => t.type === "expense" && t.category === budget.category)
        .reduce((sum, t) => sum + t.amount, 0);
      const percent = tracker.calculateBudgetUsage(budget.limit, spent);

      if (percent >= 100) {
        insights.push({
          tone: "warn",
          icon: "icon-alert",
          text: `${budget.category} exceeded its budget by ${Utils.formatWhole(spent - budget.limit)}.`
        });
      } else if (percent >= 80) {
        insights.push({
          tone: "warn",
          icon: "icon-alert",
          text: `${budget.category} has used ${percent}% of its category budget.`
        });
      }
    });

    // spending increased compared to previous month
    if (prevStats.expenses > 0 && stats.expenses > 0) {
      const diff = stats.expenses - prevStats.expenses;
      const percentChange = Math.round((diff / prevStats.expenses) * 100);

      if (percentChange >= 10) {
        insights.push({
          tone: "warn",
          icon: "icon-arrow-up",
          text: `Your spending increased by ${percentChange}% compared to ${Utils.monthName(previous.month)}.`
        });
      } else if (percentChange <= -10) {
        insights.push({
          tone: "good",
          icon: "icon-arrow-down",
          text: `Your spending dropped by ${Math.abs(percentChange)}% compared to ${Utils.monthName(previous.month)}.`
        });
      }

      // category level increase
      const category = findBiggestCategoryIncrease(stats, prevStats);
      if (category) {
        insights.push({
          tone: "warn",
          icon: "icon-arrow-up",
          text: `${category.name} spending increased this month.`
        });
      }
    }

    // savings
    if (stats.income > 0) {
      if (stats.balance >= 0) {
        insights.push({
          tone: "good",
          icon: "icon-check",
          text: `You saved ${Utils.formatWhole(stats.balance)} this month — keep it up!`
        });
      } else {
        insights.push({
          tone: "warn",
          icon: "icon-alert",
          text: `Your expenses exceeded your income by ${Utils.formatWhole(Math.abs(stats.balance))}.`
        });
      }
    }

    return insights.slice(0, 6);
  }

  function findBiggestCategoryIncrease(stats, prevStats) {
    const current = categoryBreakdown(stats.list);
    const previous = categoryBreakdown(prevStats.list);

    let best = null;
    current.forEach(item => {
      const prev = previous.find(p => p.name === item.name);
      if (prev && item.total > prev.total * 1.15) {
        if (!best || item.total - prev.total > best.diff) {
          best = { name: item.name, diff: item.total - prev.total };
        }
      }
    });
    return best;
  }

  /* ---------- NOTIFICATIONS ---------- */

  function generateNotifications() {
    const tracker = ExpenseTracker.getInstance();
    const now = new Date();
    const monthKeyValue = Utils.monthKey(now.getFullYear(), now.getMonth());
    const notifications = [];

    // due recurring payments
    const due = tracker.getDueRecurring();
    if (due.length) {
      notifications.push({
        tone: "warn",
        icon: "icon-repeat",
        text: `${due.length} recurring payment${due.length > 1 ? "s are" : " is"} due: ${due.map(d => d.name).join(", ")}.`
      });
    }

    // budget warnings of the currently viewed month
    const stats = monthStats(tracker.getTransactions(), now.getFullYear(), now.getMonth());
    const monthlyBudget = tracker.getMonthlyBudget(monthKeyValue);
    if (monthlyBudget) {
      const used = tracker.calculateBudgetUsage(monthlyBudget.limit, stats.expenses);
      if (used >= 100) {
        notifications.push({
          tone: "danger",
          icon: "icon-alert",
          text: `Monthly budget exceeded by ${Utils.formatWhole(stats.expenses - monthlyBudget.limit)}.`
        });
      } else if (used >= 80) {
        notifications.push({
          tone: "warn",
          icon: "icon-wallet",
          text: `You have used ${used}% of this month's budget.`
        });
      }
    }

    tracker.getCategoryBudgets(monthKeyValue).forEach(budget => {
      const spent = stats.list
        .filter(t => t.type === "expense" && t.category === budget.category)
        .reduce((sum, t) => sum + t.amount, 0);
      if (spent >= budget.limit) {
        notifications.push({
          tone: "danger",
          icon: "icon-tag",
          text: `${budget.category} budget is exhausted (${Utils.formatWhole(spent)} / ${Utils.formatWhole(budget.limit)}).`
        });
      }
    });

    if (!notifications.length) {
      notifications.push({ tone: "info", icon: "icon-check", text: "You are all caught up. No alerts right now." });
    }

    return notifications.slice(0, 6);
  }

  /* ---------- CHART HELPERS ---------- */

  function themeColors() {
    const light = document.documentElement.dataset.theme === "light";
    return {
      text: light ? "rgba(16,26,48,0.62)" : "rgba(233,238,251,0.62)",
      grid: light ? "rgba(16,26,48,0.08)" : "rgba(255,255,255,0.07)",
      tooltipBg: light ? "#ffffff" : "#131a2e",
      tooltipText: light ? "#101a30" : "#e9eefb"
    };
  }

  function destroyChart(id) {
    if (chartInstances[id]) {
      chartInstances[id].destroy();
      delete chartInstances[id];
    }
  }

  function showFallback(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const box = canvas.closest(".chart-box");
    canvas.style.display = "none";
    const fallback = box ? box.querySelector(".chart-fallback") : null;
    if (fallback) fallback.hidden = false;
  }

  function renderChart(canvasId, config) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    if (!window.Chart) {
      showFallback(canvasId);
      return;
    }

    canvas.style.display = "";
    const fallback = canvas.closest(".chart-box")?.querySelector(".chart-fallback");
    if (fallback) fallback.hidden = true;

    destroyChart(canvasId);
    chartInstances[canvasId] = new Chart(canvas.getContext("2d"), config);
  }

  function doughnutConfig(labels, data, colors) {
    const colors2 = themeColors();
    return {
      type: "doughnut",
      data: {
        labels,
        datasets: [{
          data,
          backgroundColor: colors,
          borderColor: "transparent",
          hoverOffset: 8,
          spacing: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "66%",
        plugins: {
          legend: {
            position: "bottom",
            labels: {
              color: colors2.text,
              usePointStyle: true,
              pointStyleWidth: 9,
              padding: 14,
              font: { size: 11, family: "Segoe UI, sans-serif" }
            }
          },
          tooltip: {
            backgroundColor: colors2.tooltipBg,
            titleColor: colors2.tooltipText,
            bodyColor: colors2.tooltipText,
            padding: 10,
            cornerRadius: 10,
            callbacks: {
              label: context => ` ${context.label}: ${Utils.formatCurrency(context.raw)}`
            }
          }
        }
      }
    };
  }

  /* ---------- CHART RENDERERS ---------- */

  function renderDoughnut(canvasId, transactions) {
    const breakdown = categoryBreakdown(transactions);
    const labels = breakdown.length ? breakdown.map(item => item.name) : ["No expenses"];
    const data = breakdown.length ? breakdown.map(item => item.total) : [1];
    const colors = breakdown.length ? breakdown.map(item => item.color) : ["rgba(148,163,184,0.25)"];
    renderChart(canvasId, doughnutConfig(labels, data, colors));
  }

  function renderBar(canvasId, series) {
    const colors = themeColors();
    renderChart(canvasId, {
      type: "bar",
      data: {
        labels: series.map(item => item.label),
        datasets: [
          {
            label: "Income",
            data: series.map(item => item.income),
            backgroundColor: "rgba(52, 211, 153, 0.85)",
            borderRadius: 7,
            maxBarThickness: 26
          },
          {
            label: "Expenses",
            data: series.map(item => item.expense),
            backgroundColor: "rgba(251, 113, 133, 0.85)",
            borderRadius: 7,
            maxBarThickness: 26
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: colors.tooltipBg,
            titleColor: colors.tooltipText,
            bodyColor: colors.tooltipText,
            padding: 10,
            cornerRadius: 10,
            callbacks: {
              label: context => ` ${context.dataset.label}: ${Utils.formatCurrency(context.raw)}`
            }
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: colors.text, font: { size: 11 } },
            border: { display: false }
          },
          y: {
            beginAtZero: true,
            grid: { color: colors.grid },
            ticks: {
              color: colors.text,
              font: { size: 11 },
              callback: value => value >= 1000 ? `₱${(value / 1000)}k` : `₱${value}`
            },
            border: { display: false }
          }
        }
      }
    });
  }

  function renderLine(canvasId, daily) {
    const colors = themeColors();
    const accent = getComputedStyle(document.documentElement).getPropertyValue("--accent").trim() || "#7c5cff";

    renderChart(canvasId, {
      type: "line",
      data: {
        labels: daily.map(item => item.day),
        datasets: [{
          label: "Daily spending",
          data: daily.map(item => item.total),
          borderColor: accent,
          backgroundColor: `${accent}26`,
          fill: true,
          tension: 0.35,
          borderWidth: 2.5,
          pointRadius: 0,
          pointHoverRadius: 5,
          pointBackgroundColor: accent
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: colors.tooltipBg,
            titleColor: colors.tooltipText,
            bodyColor: colors.tooltipText,
            padding: 10,
            cornerRadius: 10,
            callbacks: {
              title: items => `Day ${items[0].label}`,
              label: context => ` ${Utils.formatCurrency(context.raw)}`
            }
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: colors.text, font: { size: 10 }, maxTicksLimit: 16 },
            border: { display: false }
          },
          y: {
            beginAtZero: true,
            grid: { color: colors.grid },
            ticks: {
              color: colors.text,
              font: { size: 11 },
              callback: value => value >= 1000 ? `₱${(value / 1000)}k` : `₱${value}`
            },
            border: { display: false }
          }
        }
      }
    });
  }

  function destroyAllCharts() {
    Object.keys(chartInstances).forEach(destroyChart);
  }

  return {
    PALETTE,
    transactionsForMonth,
    categoryColor,
    categoryBreakdown,
    monthlySeries,
    dailySeries,
    monthStats,
    generateInsights,
    generateNotifications,
    renderDoughnut,
    renderBar,
    renderLine,
    destroyChart,
    destroyAllCharts
  };
})();
