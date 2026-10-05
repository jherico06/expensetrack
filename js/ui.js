/* ============================================================
   ui.js
   DOM MANIPULATION – renderers, modals, toasts, filters
   All visual updates of ExpenseFlow live here.
   ============================================================ */

const UI = (() => {

  /* ==========================================================
     VARIABLES AND APPLICATION STATE
     ========================================================== */
  const PAGES = ["dashboard", "transactions", "budgets", "categories", "recurring", "reports", "settings", "faq", "profile", "about"];

  const PAGE_TITLES = {
    dashboard: "Dashboard",
    transactions: "Entries",
    budgets: "Budgets",
    categories: "Categories",
    recurring: "Recurring Expenses",
    reports: "Reports",
    settings: "Settings",
    faq: "FAQ & Guide",
    profile: "User Profile",
    about: "About"
  };

  const PAGE_SUBTITLES = {
    dashboard: "",
    transactions: "Search, filter, sort and manage every financial entry.",
    budgets: "Set monthly limits and monitor budget usage per category.",
    categories: "Organize how income and expenses are classified.",
    recurring: "Manage bills, subscriptions and allowances that repeat.",
    reports: "Visualize your financial patterns, trends and insights.",
    settings: "Customize ExpenseFlow and manage your saved records.",
    faq: "Detailed user tutorials, guides, and answers to common questions.",
    profile: "View and update your personal details.",
    about: "Learn what ExpenseFlow can do for you."
  };

  let currentPage = "dashboard";
  let currentMonth = new Date().getMonth();
  let currentYear = new Date().getFullYear();
  let searchTerm = "";
  let currentSort = "newest";
  let editingTransactionId = null;
  let selectedIcon = "package";
  let confirmResolver = null;

  const filters = {
    type: "all",
    category: "all",
    paymentMethod: "all",
    dateRange: "all",
    customFrom: "",
    customTo: "",
    min: "",
    max: ""
  };

  const ICON_CHOICES = [
    "utensils", "car", "graduation-cap", "receipt", "shopping-bag", "clapperboard",
    "heart-pulse", "scissors", "smartphone", "plane", "package",
    "briefcase", "wallet", "laptop", "building-2", "gift", "coins",
    "coffee", "gamepad-2", "home", "dumbbell", "paw-print", "lightbulb", "music"
  ];

  /* ==========================================================
     SMALL DOM HELPERS
     ========================================================== */
  const qs = selector => document.querySelector(selector);
  const qsa = selector => Array.from(document.querySelectorAll(selector));
  const esc = value => Utils.escapeHtml(value);

  function iconSvg(id, className = "icon") {
    return `<svg class="${className}" aria-hidden="true"><use href="#${id}"></use></svg>`;
  }

  function tracker() {
    return ExpenseTracker.getInstance();
  }

  /* ==========================================================
     THEME
     ========================================================== */
  function setTheme(theme, save = true) {
    const value = theme === "light" ? "light" : "dark";
    document.documentElement.dataset.theme = value;

    qsa(".seg-btn").forEach(button => {
      button.classList.toggle("active", button.dataset.themeValue === value);
    });

    if (save) tracker().updateSettings({ theme: value });
  }

  function toggleTheme() {
    const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    setTheme(next);
    renderPage(currentPage);
    showToast(`${next === "dark" ? "Dark" : "Light"} theme enabled.`, "info", "Appearance");
  }

  /* ==========================================================
     TOAST NOTIFICATIONS
     ========================================================== */
  function showToast(message, type = "success", title = "") {
    const container = qs("#toastContainer");
    if (!container) return;

    const icons = {
      success: "icon-check",
      error: "icon-x",
      warning: "icon-alert",
      info: "icon-info"
    };

    const defaultTitles = {
      success: "Success",
      error: "Something went wrong",
      warning: "Warning",
      info: "Information"
    };

    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.setAttribute("role", "status");
    toast.innerHTML = `
      <span class="toast-icon">${iconSvg(icons[type] || "icon-info")}</span>
      <div class="toast-body">
        <strong>${esc(title || defaultTitles[type])}</strong>
        <span>${esc(message)}</span>
      </div>
      <button class="toast-close" aria-label="Dismiss notification">${iconSvg("icon-x")}</button>
    `;

    const remove = () => {
      if (!toast.isConnected) return;
      toast.classList.add("toast-out");
      setTimeout(() => toast.remove(), 240);
    };

    toast.querySelector(".toast-close").addEventListener("click", remove);
    container.appendChild(toast);
    setTimeout(remove, 3600);
  }

  /* ==========================================================
     MODALS
     ========================================================== */
  function openModal(id) {
    const root = document.getElementById(id);
    if (!root) return;
    root.hidden = false;
    document.body.style.overflow = "hidden";
    const focusable = root.querySelector("input:not([type=hidden]), select, textarea, button");
    if (focusable) setTimeout(() => focusable.focus(), 60);
  }

  function closeModal(id) {
    if (id) {
      const root = document.getElementById(id);
      if (root) root.hidden = true;
    } else {
      qsa(".modal-root").forEach(root => { root.hidden = true; });
    }
    if (!qsa(".modal-root").some(root => !root.hidden)) {
      document.body.style.overflow = "";
    }
  }

  function closeTopModal() {
    if (qs("#confirmModal") && !qs("#confirmModal").hidden) {
      settleConfirm(false);
      return;
    }
    const open = qsa(".modal-root").find(root => !root.hidden);
    if (open) closeModal(open.id);
  }

  function confirmAction({ title, message, confirmText = "Delete", danger = true }) {
    return new Promise(resolve => {
      confirmResolver = resolve;
      qs("#confirmTitle").textContent = title;
      qs("#confirmMessage").textContent = message;
      qs("#confirmOk").textContent = confirmText;
      qs("#confirmOk").className = danger ? "btn btn-danger" : "btn btn-primary";
      openModal("confirmModal");
      setTimeout(() => qs("#confirmCancel").focus(), 60);
    });
  }

  function settleConfirm(value) {
    closeModal("confirmModal");
    if (confirmResolver) {
      confirmResolver(value);
      confirmResolver = null;
    }
  }

  /* ==========================================================
     NAVIGATION / HEADER
     ========================================================== */
  function setActivePage(page) {
    if (!PAGES.includes(page)) page = "dashboard";
    currentPage = page;

    qsa(".page").forEach(section => {
      section.classList.toggle("active", section.id === `page-${page}`);
    });

    qsa(".nav-link[data-page]").forEach(link => {
      link.classList.toggle("active", link.dataset.page === page);
    });

    renderHeader();
    renderPage(page);

    if (window.innerWidth <= 992) document.body.classList.remove("sidebar-open");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function renderHeader() {
    qs("#pageTitle").textContent = PAGE_TITLES[currentPage] || "Dashboard";

    let subtitle = PAGE_SUBTITLES[currentPage];
    if (currentPage === "dashboard") {
      subtitle = `${Utils.getGreeting()}, welcome back. Here is your financial overview for ${Utils.monthName(currentMonth)}.`;
    }
    qs("#pageSubtitle").textContent = subtitle;
    qs("#headerMonthText").textContent = Utils.monthLabel(currentYear, currentMonth);
  }

  function renderMonthLabels() {
    const label = Utils.monthLabel(currentYear, currentMonth);
    qsa("[data-month-label]").forEach(element => { element.textContent = label; });
    qs("#headerMonthText").textContent = label;
  }

  function shiftMonth(delta) {
    const shifted = Utils.shiftMonth(currentYear, currentMonth, delta);
    currentYear = shifted.year;
    currentMonth = shifted.month;
    renderMonthLabels();
    renderHeader();
    renderPage(currentPage);
  }

  function goToCurrentMonth() {
    const now = new Date();
    currentYear = now.getFullYear();
    currentMonth = now.getMonth();
    renderMonthLabels();
    renderHeader();
    renderPage(currentPage);
  }

  function renderNotifications() {
    const list = Analytics.generateNotifications();
    const container = qs("#notifList");

    container.innerHTML = list.length
      ? list.map(note => `
          <div class="notif-item ${note.tone}">
            ${iconSvg(note.icon)}
            <span>${esc(note.text)}</span>
          </div>`).join("")
      : `<p class="notif-empty">No notifications.</p>`;

    const alertCount = list.filter(note => note.tone !== "info").length;
    const badge = qs("#notifBadge");
    badge.hidden = alertCount === 0;
    badge.textContent = String(alertCount);
  }

  function toggleNotifications() {
    const panel = qs("#notifPanel");
    const button = qs("#btnNotifications");
    const willOpen = panel.hidden;
    panel.hidden = !willOpen;
    button.setAttribute("aria-expanded", String(willOpen));
    if (willOpen) renderNotifications();
  }

  function closeNotifications() {
    const panel = qs("#notifPanel");
    if (panel && !panel.hidden) {
      panel.hidden = true;
      qs("#btnNotifications").setAttribute("aria-expanded", "false");
    }
  }

  function toggleSidebar(force) {
    if (window.innerWidth <= 992) {
      const open = typeof force === "boolean" ? force : !document.body.classList.contains("sidebar-open");
      document.body.classList.toggle("sidebar-open", open);
    } else {
      const collapsed = typeof force === "boolean" ? !force : !document.body.classList.contains("sidebar-collapsed");
      document.body.classList.toggle("sidebar-collapsed", collapsed);
      tracker().updateSettings({ sidebarCollapsed: collapsed });
    }
  }

  /* ==========================================================
     CATEGORY SELECTS
     ========================================================== */
  function populateCategorySelect(select, type, selectedValue = "") {
    if (!select) return;
    const categories = tracker().getCategoriesByType(type);

    select.innerHTML = `<option value="">Select category</option>` +
      categories.map(category =>
        `<option value="${esc(category.name)}">${category.icon} ${esc(category.name)}</option>`
      ).join("");

    if (selectedValue && categories.some(c => c.name === selectedValue)) {
      select.value = selectedValue;
    }
  }

  function renderFilterOptions() {
    const select = qs("#filterCategory");
    if (!select) return;

    const categories = tracker().getCategories();
    const previous = filters.category;

    select.innerHTML = `<option value="all">All categories</option>` +
      categories.map(category =>
        `<option value="${esc(category.name)}">${category.icon} ${esc(category.name)}</option>`
      ).join("");

    select.value = categories.some(c => c.name === previous) ? previous : "all";
    filters.category = select.value;
  }

  /* ==========================================================
     DASHBOARD
     ========================================================== */
  function budgetStateLabel(state) {
    return { safe: "Safe", moderate: "Moderate", warning: "Warning", exceeded: "Exceeded" }[state] || "Safe";
  }

  function renderDashboard() {
    const all = tracker().getTransactions();
    const hasData = all.length > 0;

    qs("#dashEmpty").hidden = hasData;
    qs("#dashContent").hidden = !hasData;

    if (!hasData) return;

    const stats = Analytics.monthStats(all, currentYear, currentMonth);
    const previous = Utils.shiftMonth(currentYear, currentMonth, -1);
    const prevStats = Analytics.monthStats(all, previous.year, previous.month);

    renderBalanceCard(stats, prevStats);
    renderBudgetCard(stats);
    renderIncomeCard(stats);
    renderExpenseCard(stats, prevStats);
    renderUsageCard(stats);
    renderTopSpending(stats);
    renderInsights("#dashInsights");
    renderRecent(stats);

    Analytics.renderDoughnut("chartDashCategory", stats.list);
  }

  function renderBalanceCard(stats, prevStats) {
    qs("#balanceAmount").textContent = Utils.formatCurrency(stats.balance);
    qs("#balanceIncome").textContent = Utils.formatCurrency(stats.income);
    qs("#balanceExpense").textContent = Utils.formatCurrency(stats.expenses);

    const previous = Utils.shiftMonth(currentYear, currentMonth, -1);
    qs("#balancePeriodLabel").textContent =
      `Compared to ${Utils.monthLabel(previous.year, previous.month)}`;

    const changeWrap = qs("#balanceChangeWrap");
    const changeText = qs("#balanceChange");

    if (prevStats.balance !== 0) {
      const change = Math.round(((stats.balance - prevStats.balance) / Math.abs(prevStats.balance)) * 100);
      changeText.textContent = `${change >= 0 ? "+" : ""}${change}%`;
      changeWrap.classList.toggle("down", change < 0);
      changeWrap.hidden = false;
    } else {
      changeText.textContent = "—";
      changeWrap.classList.remove("down");
      changeWrap.hidden = false;
    }

    const max = Math.max(stats.income, stats.expenses, 1);
    qs("#balanceIncomeBar").style.width = `${Math.round((stats.income / max) * 100)}%`;
    qs("#balanceExpenseBar").style.width = `${Math.round((stats.expenses / max) * 100)}%`;
  }

  function renderBudgetCard(stats) {
    const monthKeyValue = Utils.monthKey(currentYear, currentMonth);
    const budget = tracker().getMonthlyBudget(monthKeyValue);

    qs("#budgetCardBody").hidden = !budget;
    qs("#budgetCardEmpty").hidden = Boolean(budget);
    if (!budget) return;

    const percent = tracker().calculateBudgetUsage(budget.limit, stats.expenses);
    const state = tracker().budgetState(percent);
    const remaining = budget.limit - stats.expenses;

    qs("#budgetLimit").textContent = Utils.formatWhole(budget.limit);
    qs("#budgetSpent").textContent = Utils.formatWhole(stats.expenses);
    qs("#budgetRemaining").textContent = Utils.formatWhole(remaining);
    qs("#budgetRemaining").className = remaining < 0 ? "negative" : "positive";
    qs("#budgetPercent").textContent = `${percent}%`;

    const stateChip = qs("#budgetState");
    stateChip.textContent = budgetStateLabel(state);
    stateChip.className = `chip-state ${state}`;

    const fill = qs("#budgetBarFill");
    fill.style.width = `${Math.min(percent, 100)}%`;
    fill.className = `progress-fill ${state}`;
    qs("#budgetBar").setAttribute("aria-valuenow", String(Math.min(percent, 100)));
  }

  function renderIncomeCard(stats) {
    qs("#incomeTotal").textContent = Utils.formatCurrency(stats.income);
    qs("#incomeCount").textContent = String(stats.incomeCount);
    qs("#incomeLargest").textContent = stats.largestIncome
      ? Utils.formatWhole(stats.largestIncome.amount)
      : "—";
    qs("#incomeRecent").textContent = stats.largestIncome
      ? latestIncomeText(stats.list)
      : "—";
  }

  function latestIncomeText(list) {
    const incomeList = list.filter(t => t.type === "income");
    if (!incomeList.length) return "—";
    const latest = incomeList.reduce((newest, t) => (t.date > newest.date ? t : newest), incomeList[0]);
    return `${latest.title} · ${Utils.formatShortDate(latest.date)}`;
  }

  function renderExpenseCard(stats, prevStats) {
    qs("#expenseTotal").textContent = Utils.formatCurrency(stats.expenses);
    qs("#expenseCount").textContent = String(stats.expenseCount);
    qs("#expenseHighest").textContent = stats.highestExpense
      ? Utils.formatWhole(stats.highestExpense.amount)
      : "—";
    qs("#expenseAvg").textContent = stats.expenseCount
      ? Utils.formatWhole(stats.averageExpense)
      : "—";

    const compare = qs("#expenseCompare");
    if (prevStats.expenses > 0 && stats.expenses > 0) {
      const previous = Utils.shiftMonth(currentYear, currentMonth, -1);
      const change = Math.round(((stats.expenses - prevStats.expenses) / prevStats.expenses) * 100);
      const direction = change > 0 ? "up" : change < 0 ? "down" : "";
      const word = change > 0 ? "more" : change < 0 ? "less" : "same as";
      compare.className = `compare-line ${direction}`;
      compare.innerHTML = `${iconSvg(change >= 0 ? "icon-arrow-up" : "icon-arrow-down")}
        <span>${Math.abs(change)}% ${word} than ${Utils.monthName(previous.month)}</span>`;
    } else {
      compare.className = "compare-line";
      compare.innerHTML = `<span class="muted">No comparison data available.</span>`;
    }
  }

  function renderUsageCard(stats) {
    const monthKeyValue = Utils.monthKey(currentYear, currentMonth);
    const budget = tracker().getMonthlyBudget(monthKeyValue);
    const ring = qs("#usageRing");

    if (!budget) {
      qs("#usagePercent").textContent = "—";
      qs("#usageLabel").textContent = "no budget set";
      qs("#usageState").textContent = "No budget";
      qs("#usageState").className = "chip-state";
      qs("#usageHint").textContent = "Create a monthly budget to start monitoring usage.";
      ring.style.setProperty("--pct", 0);
      ring.style.setProperty("--ring-color", "var(--accent)");
      return;
    }

    const percent = tracker().calculateBudgetUsage(budget.limit, stats.expenses);
    const state = tracker().budgetState(percent);
    const colors = {
      safe: "#34d399",
      moderate: "#60a5fa",
      warning: "#fbbf24",
      exceeded: "#fb7185"
    };

    qs("#usagePercent").textContent = `${percent}%`;
    qs("#usageLabel").textContent = "of budget";
    qs("#usageState").textContent = budgetStateLabel(state);
    qs("#usageState").className = `chip-state ${state}`;
    qs("#usageHint").textContent = percent >= 100
      ? `Limit exceeded by ${Utils.formatWhole(stats.expenses - budget.limit)}.`
      : `${Utils.formatWhole(budget.limit - stats.expenses)} left to spend this month.`;

    ring.style.setProperty("--pct", Math.min(percent, 100));
    ring.style.setProperty("--ring-color", colors[state]);
  }

  function renderTopSpending(stats) {
    const list = qs("#topSpendingList");
    const breakdown = Analytics.categoryBreakdown(stats.list);

    if (!breakdown.length) {
      list.innerHTML = "";
      qs("#topSpendingEmpty").hidden = false;
      return;
    }

    qs("#topSpendingEmpty").hidden = true;
    const top = breakdown.slice(0, 5);
    const maxTotal = top[0].total;

    list.innerHTML = top.map((item, index) => `
      <li class="top-item">
        <span class="top-rank">${index + 1}</span>
        <div class="top-main">
          <div class="top-name">
            <span class="top-item-label">${Utils.renderCategoryIcon(item.icon || tracker().getCategoryIcon(item.name))} ${esc(item.name)}</span>
            <span class="pct">${item.pct}%</span>
          </div>
          <div class="top-bar">
            <span style="width:${Math.max(6, Math.round((item.total / maxTotal) * 100))}%;background:${item.color}"></span>
          </div>
        </div>
        <span class="top-amount">${Utils.formatWhole(item.total)}</span>
      </li>
    `).join("");
  }

  function renderInsights(targetSelector) {
    const target = qs(targetSelector);
    if (!target) return;

    const insights = Analytics.generateInsights(currentYear, currentMonth);

    target.innerHTML = insights.map(insight => `
      <li class="insight-item ${insight.tone === "good" ? "good" : insight.tone === "warn" ? "warn" : ""}">
        ${iconSvg(insight.icon)}
        <span>${esc(insight.text)}</span>
      </li>
    `).join("");
  }

  function renderRecent(stats) {
    const list = qs("#recentList");
    const recent = applySortStrategy("newest", stats.list).slice(0, 7);

    if (!recent.length) {
      list.innerHTML = "";
      qs("#recentEmpty").hidden = false;
      qs("#recentEmpty").textContent = `No entries recorded in ${Utils.monthName(currentMonth)}.`;
      return;
    }

    qs("#recentEmpty").hidden = true;
    list.innerHTML = recent.map(transaction => `
      <li class="recent-item" data-action="tx-view" data-id="${transaction.id}" tabindex="0" role="button">
        <span class="cat-avatar">${Utils.renderCategoryIcon(tracker().getCategoryIcon(transaction.category))}</span>
        <div class="tx-main">
          <strong>${esc(transaction.title)}</strong>
          <span>${esc(transaction.category)} · ${Utils.formatDate(transaction.date)}</span>
        </div>
        <span class="type-pill ${transaction.type}">${transaction.type}</span>
        <span class="tx-amount ${transaction.type}">
          ${transaction.type === "income" ? "+" : "-"}${Utils.formatCurrency(transaction.amount)}
        </span>
      </li>
    `).join("");
  }

  /* ==========================================================
     TRANSACTION SEARCH / FILTER / SORT
     ========================================================== */
  function searchTransactions(list) {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return list;

    return list.filter(transaction =>
      transaction.title.toLowerCase().includes(term) ||
      transaction.category.toLowerCase().includes(term) ||
      (transaction.note || "").toLowerCase().includes(term) ||
      transaction.paymentMethod.toLowerCase().includes(term)
    );
  }

  function matchesDateRange(dateISO) {
    const today = Utils.todayISO();
    const now = new Date();

    switch (filters.dateRange) {
      case "today":
        return dateISO === today;

      case "week": {
        const start = Utils.addDays(today, -((now.getDay() + 6) % 7));
        const end = Utils.addDays(start, 6);
        return dateISO >= start && dateISO <= end;
      }

      case "month": {
        const range = Utils.monthRange(now.getFullYear(), now.getMonth());
        return dateISO >= range.start && dateISO <= range.end;
      }

      case "last-month": {
        const previous = Utils.shiftMonth(now.getFullYear(), now.getMonth(), -1);
        const range = Utils.monthRange(previous.year, previous.month);
        return dateISO >= range.start && dateISO <= range.end;
      }

      case "custom": {
        if (filters.customFrom && dateISO < filters.customFrom) return false;
        if (filters.customTo && dateISO > filters.customTo) return false;
        return true;
      }

      default:
        return true;
    }
  }

  function filterTransactions() {
    const list = tracker().getTransactions();

    const result = list.filter(transaction => {
      if (filters.type !== "all" && transaction.type !== filters.type) return false;
      if (filters.category !== "all" && transaction.category !== filters.category) return false;
      if (filters.paymentMethod !== "all" && transaction.paymentMethod !== filters.paymentMethod) return false;
      if (!matchesDateRange(transaction.date)) return false;

      const amount = Number(transaction.amount);
      if (filters.min !== "" && amount < Number(filters.min)) return false;
      if (filters.max !== "" && amount > Number(filters.max)) return false;

      return true;
    });

    return searchTransactions(result);
  }

  function activeFilterCount() {
    let count = 0;
    if (filters.type !== "all") count++;
    if (filters.category !== "all") count++;
    if (filters.paymentMethod !== "all") count++;
    if (filters.dateRange !== "all") count++;
    if (filters.min !== "") count++;
    if (filters.max !== "") count++;
    return count;
  }

  function syncFiltersFromForm() {
    filters.type = qs("#filterType").value;
    filters.category = qs("#filterCategory").value;
    filters.paymentMethod = qs("#filterPayment").value;
    filters.dateRange = qs("#filterDateRange").value;
    filters.customFrom = qs("#customFrom").value;
    filters.customTo = qs("#customTo").value;
    filters.min = qs("#filterMin").value;
    filters.max = qs("#filterMax").value;

    qs("#customRangeWrap").hidden = filters.dateRange !== "custom";
    renderTransactions();
  }

  function clearFilters() {
    filters.type = "all";
    filters.category = "all";
    filters.paymentMethod = "all";
    filters.dateRange = "all";
    filters.customFrom = "";
    filters.customTo = "";
    filters.min = "";
    filters.max = "";
    searchTerm = "";
    currentSort = "newest";

    qs("#filterType").value = "all";
    qs("#filterCategory").value = "all";
    qs("#filterPayment").value = "all";
    qs("#filterDateRange").value = "all";
    qs("#customFrom").value = "";
    qs("#customTo").value = "";
    qs("#filterMin").value = "";
    qs("#filterMax").value = "";
    qs("#searchInput").value = "";
    qs("#sortSelect").value = "newest";
    qs("#customRangeWrap").hidden = true;

    renderTransactions();
    showToast("All filters have been cleared.", "info", "Filters");
  }

  function renderTransactions() {
    const all = tracker().getTransactions();
    const filtered = filterTransactions();
    // STRATEGY DESIGN PATTERN – sorting is chosen at runtime
    const sorted = applySortStrategy(currentSort, filtered);

    qs("#txCount").textContent = String(sorted.length);

    const count = activeFilterCount();
    const badge = qs("#filterCount");
    badge.hidden = count === 0;
    badge.textContent = String(count);

    qs("#filterSummary").textContent =
      `Showing ${sorted.length} of ${all.length} entr${all.length === 1 ? "y" : "ies"}`;

    const list = qs("#txList");
    const empty = qs("#txEmpty");

    if (!sorted.length) {
      list.innerHTML = "";
      empty.hidden = false;

      if (!all.length) {
        empty.innerHTML = `
          <span class="empty-icon">${iconSvg("icon-inbox")}</span>
          <h3>No entries yet</h3>
          <p>Start tracking your finances by adding your first entry.</p>
          <button class="btn btn-primary btn-sm" data-action="open-add-transaction">
            ${iconSvg("icon-plus")}<span>Add Entry</span>
          </button>`;
      } else {
        empty.innerHTML = `
          <span class="empty-icon">${iconSvg("icon-search")}</span>
          <h3>No matching entries</h3>
          <p>Try adjusting your search or clearing the active filters.</p>
          <button class="btn btn-soft btn-sm" data-action="clear-filters">
            ${iconSvg("icon-x")}<span>Clear Filters</span>
          </button>`;
      }
      return;
    }

    empty.hidden = true;
    list.innerHTML = sorted.map(transaction => transactionRow(transaction)).join("");
  }

  function transactionRow(transaction) {
    const sign = transaction.type === "income" ? "+" : "-";
    return `
      <li class="tx-row" data-id="${transaction.id}">
        <div class="tx-cell-title">
          <span class="cat-avatar">${Utils.renderCategoryIcon(tracker().getCategoryIcon(transaction.category))}</span>
          <div class="tx-main">
            <strong>${esc(transaction.title)}</strong>
            ${transaction.note ? `<span class="tx-note">${esc(transaction.note)}</span>` : ""}
          </div>
        </div>
        <span class="tx-cell category-cell">${esc(transaction.category)}</span>
        <span class="tx-cell date-cell">${Utils.formatDate(transaction.date)}</span>
        <span class="tx-cell payment-cell">${esc(transaction.paymentMethod)}</span>
        <span class="tx-cell type-cell">
          <span class="type-pill ${transaction.type}">${transaction.type}</span>
        </span>
        <span class="tx-amount-cell tx-amount ${transaction.type}">${sign}${Utils.formatCurrency(transaction.amount)}</span>
        <div class="tx-actions">
          <button class="icon-btn sm" data-action="toggle-menu" data-id="${transaction.id}"
                  aria-label="Actions for ${esc(transaction.title)}" aria-haspopup="true">
            ${iconSvg("icon-dots")}
          </button>
        </div>
      </li>`;
  }

  function closeActionMenus() {
    qsa(".action-menu").forEach(menu => menu.remove());
  }

  function toggleActionMenu(id) {
    const row = document.querySelector(`.tx-row[data-id="${id}"]`);
    if (!row) return;

    const existing = row.querySelector(".action-menu");
    closeActionMenus();
    if (existing) return;

    const menu = document.createElement("div");
    menu.className = "action-menu";
    menu.innerHTML = `
      <button data-action="tx-view" data-id="${id}">${iconSvg("icon-eye")} View</button>
      <button data-action="tx-edit" data-id="${id}">${iconSvg("icon-edit")} Edit</button>
      <button data-action="tx-duplicate" data-id="${id}">${iconSvg("icon-copy")} Duplicate</button>
      <button data-action="tx-delete" data-id="${id}" class="danger">${iconSvg("icon-trash")} Delete</button>
    `;
    row.querySelector(".tx-actions").appendChild(menu);
  }

  /* ==========================================================
     TRANSACTION FORM
     ========================================================== */
  function setFieldError(inputId, errorId, message) {
    const input = document.getElementById(inputId);
    const error = document.getElementById(errorId);
    if (!input || !error) return;

    const field = input.closest(".field");
    if (message) {
      error.textContent = message;
      error.hidden = false;
      if (field) field.classList.add("invalid");
    } else {
      error.textContent = "";
      error.hidden = true;
      if (field) field.classList.remove("invalid");
    }
  }

  function clearTransactionErrors() {
    setFieldError("txTitle", "errTitle", null);
    setFieldError("txAmount", "errAmount", null);
    setFieldError("txCategory", "errCategory", null);
    setFieldError("txDate", "errDate", null);
    setFieldError("txPayment", "errPayment", null);
  }

  function openTransactionModal(transaction = null) {
    editingTransactionId = transaction ? transaction.id : null;
    clearTransactionErrors();

    qs("#txModalTitle").textContent = transaction ? "Edit Entry" : "Add Entry";
    qs("#txModalHint").textContent = transaction
      ? "Update the details of this entry."
      : "Record income or an expense in a few seconds.";
    qs("#txSubmitBtn span").textContent = transaction ? "Update Entry" : "Save Entry";

    const type = transaction ? transaction.type : "expense";
    qs("#txType").value = type;
    populateCategorySelect(qs("#txCategory"), type, transaction ? transaction.category : "");

    qs("#txTitle").value = transaction ? transaction.title : "";
    qs("#txAmount").value = transaction ? transaction.amount : "";
    qs("#txDate").value = transaction ? transaction.date : Utils.todayISO();
    qs("#txPayment").value = transaction ? transaction.paymentMethod : "";
    qs("#txNote").value = transaction ? (transaction.note || "") : "";
    qs("#txRecurring").checked = transaction ? Boolean(transaction.recurring) : false;

    openModal("transactionModal");
  }

  function collectTransactionForm() {
    return {
      title: qs("#txTitle").value.trim(),
      amount: qs("#txAmount").value,
      type: qs("#txType").value,
      category: qs("#txCategory").value,
      date: qs("#txDate").value,
      paymentMethod: qs("#txPayment").value,
      note: qs("#txNote").value.trim(),
      recurring: qs("#txRecurring").checked
    };
  }

  function validateTransactionForm() {
    clearTransactionErrors();
    const data = collectTransactionForm();
    let valid = true;

    if (!data.title) {
      setFieldError("txTitle", "errTitle", "Entry title is required.");
      valid = false;
    }

    if (data.amount === "") {
      setFieldError("txAmount", "errAmount", "Amount is required.");
      valid = false;
    } else if (Number.isNaN(Number(data.amount))) {
      setFieldError("txAmount", "errAmount", "Amount must be a valid number.");
      valid = false;
    } else if (Number(data.amount) <= 0) {
      setFieldError("txAmount", "errAmount", "Amount must be greater than zero.");
      valid = false;
    }

    if (!data.category) {
      setFieldError("txCategory", "errCategory", "Please select a category.");
      valid = false;
    }

    const parsedDate = Utils.parseDate(data.date);
    if (!data.date || Number.isNaN(parsedDate.getTime())) {
      setFieldError("txDate", "errDate", "Please enter a valid date.");
      valid = false;
    } else if (parsedDate.getFullYear() < 2000 || parsedDate.getFullYear() > 2100) {
      setFieldError("txDate", "errDate", "Date must be between 2000 and 2100.");
      valid = false;
    }

    if (!data.paymentMethod) {
      setFieldError("txPayment", "errPayment", "Please select a payment method.");
      valid = false;
    }

    return valid ? data : null;
  }

  function saveTransaction() {
    const data = validateTransactionForm();

    if (!data) {
      showToast("Please fix the highlighted fields.", "error", "Invalid entry");
      return false;
    }

    if (editingTransactionId) {
      tracker().updateTransaction(editingTransactionId, data);
      showToast("Entry updated successfully.", "success", "Updated");
    } else {
      const transaction = TransactionFactory.createTransaction(data);
      tracker().addTransaction(transaction);
      showToast("Entry added successfully.", "success", "Entry added");
    }

    closeModal("transactionModal");
    editingTransactionId = null;
    renderAll();
    return true;
  }

  function openDetails(id) {
    const transaction = tracker().getTransaction(id);
    if (!transaction) return;

    const sign = transaction.type === "income" ? "+" : "-";
    qs("#detailsBody").innerHTML = `
      <span class="cat-avatar cat-avatar-lg" style="margin:0 auto;width:52px;height:52px;">
        ${Utils.renderCategoryIcon(tracker().getCategoryIcon(transaction.category), "cat-icon-lg")}
      </span>
      <p class="detail-amount ${transaction.type}">${sign}${Utils.formatCurrency(transaction.amount)}</p>
      <div class="detail-type">
        <span class="type-pill ${transaction.type}">${transaction.type}</span>
      </div>
      <div class="detail-grid">
        <div class="meta-box"><span>Title</span><strong>${esc(transaction.title)}</strong></div>
        <div class="meta-box"><span>Category</span><strong>${esc(transaction.category)}</strong></div>
        <div class="meta-box"><span>Date</span><strong>${Utils.formatDate(transaction.date)}</strong></div>
        <div class="meta-box"><span>Payment</span><strong>${esc(transaction.paymentMethod)}</strong></div>
        <div class="meta-box"><span>Recurring</span><strong>${transaction.recurring ? "Yes" : "No"}</strong></div>
        <div class="meta-box"><span>Created</span><strong>${Utils.formatDateTime(transaction.createdAt)}</strong></div>
        <div class="meta-box full"><span>Notes</span><strong>${transaction.note ? esc(transaction.note) : "No notes"}</strong></div>
      </div>`;

    qs("#detailsFoot").innerHTML = `
      <button class="btn btn-ghost btn-sm" data-action="tx-duplicate" data-id="${transaction.id}">
        ${iconSvg("icon-copy")}<span>Duplicate</span>
      </button>
      <button class="btn btn-soft btn-sm" data-action="tx-delete" data-id="${transaction.id}">
        ${iconSvg("icon-trash")}<span>Delete</span>
      </button>
      <button class="btn btn-primary btn-sm" data-action="tx-edit" data-id="${transaction.id}">
        ${iconSvg("icon-edit")}<span>Edit</span>
      </button>`;

    openModal("detailsModal");
  }

  async function deleteTransactionFlow(id) {
    const transaction = tracker().getTransaction(id);
    if (!transaction) return;

    const confirmed = await confirmAction({
      title: "Delete Entry?",
      message: `"${transaction.title}" will be permanently removed. This action cannot be undone.`,
      confirmText: "Delete",
      danger: true
    });

    if (!confirmed) return;

    tracker().deleteTransaction(id);
    closeModal("detailsModal");
    closeActionMenus();
    showToast("Entry deleted.", "success", "Deleted");
    renderAll();
  }

  function duplicateTransactionFlow(id) {
    const copy = tracker().duplicateTransaction(id);
    if (!copy) return;

    closeActionMenus();
    closeModal("detailsModal");
    showToast(`"${copy.title}" duplicated.`, "success", "Duplicated");
    renderAll();
  }

  /* ==========================================================
     BUDGETS
     ========================================================== */
  function renderBudgets() {
    const all = tracker().getTransactions();
    const stats = Analytics.monthStats(all, currentYear, currentMonth);
    const monthKeyValue = Utils.monthKey(currentYear, currentMonth);
    const monthlyBudget = tracker().getMonthlyBudget(monthKeyValue);

    qs("#budgetOverviewBody").hidden = !monthlyBudget;
    qs("#budgetOverviewEmpty").hidden = Boolean(monthlyBudget);

    if (monthlyBudget) {
      const percent = tracker().calculateBudgetUsage(monthlyBudget.limit, stats.expenses);
      const state = tracker().budgetState(percent);

      qs("#ovLimit").textContent = Utils.formatWhole(monthlyBudget.limit);
      qs("#ovSpent").textContent = Utils.formatWhole(stats.expenses);

      const remaining = monthlyBudget.limit - stats.expenses;
      qs("#ovRemaining").textContent = Utils.formatWhole(remaining);
      qs("#ovRemaining").className = remaining < 0 ? "negative" : "positive";
      qs("#ovPercent").textContent = `${percent}%`;

      const fill = qs("#ovBarFill");
      fill.style.width = `${Math.min(percent, 100)}%`;
      fill.className = `progress-fill ${state}`;

      const chip = qs("#ovState");
      chip.textContent = budgetStateLabel(state);
      chip.className = `chip-state ${state}`;
    }

    renderCategoryBudgets(stats, monthKeyValue);
  }

  function renderCategoryBudgets(stats, monthKeyValue) {
    const container = qs("#categoryBudgetList");
    const budgets = tracker().getCategoryBudgets(monthKeyValue);

    if (!budgets.length) {
      container.innerHTML = "";
      qs("#categoryBudgetEmpty").hidden = false;
      return;
    }

    qs("#categoryBudgetEmpty").hidden = true;
    container.innerHTML = budgets.map(budget => {
      const spent = stats.list
        .filter(t => t.type === "expense" && t.category === budget.category)
        .reduce((sum, t) => sum + t.amount, 0);

      const percent = tracker().calculateBudgetUsage(budget.limit, spent);
      const state = tracker().budgetState(percent);
      const exceededBy = spent - budget.limit;

      return `
        <article class="card budget-card">
          <div class="budget-card-head">
            <div class="budget-card-title">
              <span class="cat-avatar">${Utils.renderCategoryIcon(tracker().getCategoryIcon(budget.category))}</span>
              <strong>${esc(budget.category)}</strong>
            </div>
            <span class="chip-state ${state}">${budgetStateLabel(state)}</span>
          </div>
          <div class="budget-card-figures">
            <span class="spent ${state === "exceeded" ? "negative" : ""}">${Utils.formatWhole(spent)}</span>
            <span class="limit">/ ${Utils.formatWhole(budget.limit)}</span>
          </div>
          <div class="progress" role="progressbar" aria-valuenow="${Math.min(percent, 100)}"
               aria-label="${esc(budget.category)} budget usage">
            <span class="progress-fill ${state}" style="width:${Math.min(percent, 100)}%"></span>
          </div>
          ${percent >= 100
            ? `<p class="budget-exceeded">${iconSvg("icon-alert")} Exceeded by ${Utils.formatWhole(exceededBy)}</p>`
            : ""}
          <div class="budget-card-foot">
            <span class="muted small">${percent}% used</span>
            <div class="budget-actions">
              <button class="icon-btn sm" data-action="budget-edit" data-id="${budget.id}" aria-label="Edit budget">
                ${iconSvg("icon-edit")}
              </button>
              <button class="icon-btn sm" data-action="budget-delete" data-id="${budget.id}" aria-label="Delete budget">
                ${iconSvg("icon-trash")}
              </button>
            </div>
          </div>
        </article>`;
    }).join("");
  }

  function openBudgetModal(scope = "monthly", budgetId = null) {
    const monthKeyValue = Utils.monthKey(currentYear, currentMonth);

    qs("#budgetEditId").value = budgetId || "";
    qs("#budgetModalTitle").textContent = budgetId ? "Edit Budget" : "Set Budget";
    qs("#errBudgetLimit").hidden = true;
    qs("#errBudgetCategory").hidden = true;
    qs("#budgetLimitInput").closest(".field").classList.remove("invalid");
    qs("#budgetCategory").closest(".field").classList.remove("invalid");

    let budget = budgetId ? tracker().getBudget(budgetId) : null;

    if (!budget && scope === "monthly") {
      budget = tracker().getMonthlyBudget(monthKeyValue);
    }

    const activeScope = budget ? budget.scope : scope;
    qs("#budgetScope").value = activeScope;
    qs("#budgetCategoryWrap").hidden = activeScope !== "category";

    populateCategorySelect(
      qs("#budgetCategory"),
      "expense",
      budget && budget.category ? budget.category : ""
    );

    qs("#budgetLimitInput").value = budget ? budget.limit : "";
    qs("#budgetMonthInput").value = budget ? budget.month : monthKeyValue;
    qs("#budgetScope").disabled = Boolean(budgetId);

    openModal("budgetModal");
  }

  function saveBudget() {
    const editId = qs("#budgetEditId").value;
    const scope = qs("#budgetScope").value;
    const limitValue = qs("#budgetLimitInput").value;
    const monthKeyValue = qs("#budgetMonthInput").value;
    const category = qs("#budgetCategory").value;

    const limitField = qs("#budgetLimitInput").closest(".field");
    const categoryField = qs("#budgetCategory").closest(".field");
    qs("#errBudgetLimit").hidden = true;
    qs("#errBudgetCategory").hidden = true;
    limitField.classList.remove("invalid");
    categoryField.classList.remove("invalid");

    let valid = true;

    if (!limitValue || Number.isNaN(Number(limitValue)) || Number(limitValue) <= 0) {
      qs("#errBudgetLimit").textContent = "Limit must be greater than zero.";
      qs("#errBudgetLimit").hidden = false;
      limitField.classList.add("invalid");
      valid = false;
    }

    if (!monthKeyValue) {
      qs("#errBudgetLimit").textContent = "Please choose a month.";
      qs("#errBudgetLimit").hidden = false;
      limitField.classList.add("invalid");
      valid = false;
    }

    if (scope === "category" && !category) {
      qs("#errBudgetCategory").textContent = "Please select a category.";
      qs("#errBudgetCategory").hidden = false;
      categoryField.classList.add("invalid");
      valid = false;
    }

    if (!valid) {
      showToast("Please fix the highlighted fields.", "error", "Invalid budget");
      return;
    }

    const payload = {
      scope,
      limit: Number(limitValue),
      month: monthKeyValue
    };
    if (scope === "category") payload.category = category;

    if (editId) {
      tracker().updateBudget(editId, payload);
      showToast("Budget updated.", "success", "Budgets");
    } else {
      // avoid duplicate category budgets for the same month
      if (scope === "category") {
        const existing = tracker().getCategoryBudgets(monthKeyValue)
          .find(b => b.category === category);
        if (existing) {
          tracker().updateBudget(existing.id, { limit: payload.limit });
          showToast("Budget updated.", "success", "Budgets");
          closeModal("budgetModal");
          renderAll();
          return;
        }
      }

      tracker().addBudget({ id: `bgt_${Utils.uid()}`, ...payload });
      showToast("Budget successfully created.", "success", "Budgets");
    }

    closeModal("budgetModal");
    renderAll();
  }

  async function deleteBudgetFlow(id) {
    const budget = tracker().getBudget(id);
    if (!budget) return;

    const label = budget.scope === "monthly" ? "monthly" : `${budget.category} category`;
    const budgetMonth = Utils.monthIndexFromKey(budget.month);
    const confirmed = await confirmAction({
      title: "Delete Budget?",
      message: `The ${label} budget for ${Utils.monthLabel(budgetMonth.year, budgetMonth.month)} will be removed.`,
      confirmText: "Delete",
      danger: true
    });

    if (!confirmed) return;

    tracker().deleteBudget(id);
    showToast("Budget removed.", "success", "Budgets");
    renderAll();
  }

  /* ==========================================================
     CATEGORIES
     ========================================================== */
  function renderCategories() {
    const categories = tracker().getCategories();
    const transactions = tracker().getTransactions();

    const expenseCategories = categories.filter(c => c.type === "expense");
    const incomeCategories = categories.filter(c => c.type === "income");

    qs("#expenseCatCount").textContent = String(expenseCategories.length);
    qs("#incomeCatCount").textContent = String(incomeCategories.length);

    const build = category => {
      const usage = transactions.filter(t => t.category === category.name).length;
      return `
        <li class="cat-item" data-id="${category.id}">
          <span class="cat-avatar">${Utils.renderCategoryIcon(category.icon)}</span>
          <div class="cat-info">
            <strong>${esc(category.name)}</strong>
            <span>${usage} entr${usage === 1 ? "y" : "ies"} · ${category.type}</span>
          </div>
          <div class="cat-actions">
            <button class="icon-btn sm" data-action="category-edit" data-id="${category.id}"
                    aria-label="Edit ${esc(category.name)}">${iconSvg("icon-edit")}</button>
            <button class="icon-btn sm" data-action="category-delete" data-id="${category.id}"
                    aria-label="Delete ${esc(category.name)}">${iconSvg("icon-trash")}</button>
          </div>
        </li>`;
    };

    qs("#categoryExpenseList").innerHTML = expenseCategories.map(build).join("");
    qs("#categoryIncomeList").innerHTML = incomeCategories.map(build).join("");
  }

  function openCategoryModal(categoryId = null) {
    const category = categoryId ? tracker().getCategory(categoryId) : null;

    qs("#catEditId").value = category ? category.id : "";
    qs("#categoryModalTitle").textContent = category ? "Edit Category" : "Add Category";
    qs("#errCatName").hidden = true;
    qs("#catName").closest(".field").classList.remove("invalid");

    qs("#catName").value = category ? category.name : "";
    qs("#catType").value = category ? category.type : "expense";
    qs("#catType").disabled = false;

    selectedIcon = category ? Utils.normalizeIcon(category.icon) : "package";
    renderIconPicker();

    openModal("categoryModal");
  }

  function renderIconPicker() {
    qs("#iconPicker").innerHTML = ICON_CHOICES.map(icon => `
      <button type="button" class="icon-option ${icon === selectedIcon ? "selected" : ""}"
              data-icon="${icon}" role="radio"
              aria-checked="${icon === selectedIcon}" aria-label="Icon ${icon}">
        ${Utils.renderCategoryIcon(icon, "picker-icon")}
      </button>
    `).join("");
  }

  function selectIcon(icon) {
    selectedIcon = icon;
    renderIconPicker();
  }

  function saveCategory() {
    const editId = qs("#catEditId").value;
    const name = qs("#catName").value.trim();
    const type = qs("#catType").value;
    const nameField = qs("#catName").closest(".field");

    qs("#errCatName").hidden = true;
    nameField.classList.remove("invalid");

    if (!name) {
      qs("#errCatName").textContent = "Category name is required.";
      qs("#errCatName").hidden = false;
      nameField.classList.add("invalid");
      showToast("Please enter a category name.", "error", "Invalid category");
      return;
    }

    const duplicate = tracker().getCategories().some(c =>
      c.id !== editId && c.type === type && c.name.toLowerCase() === name.toLowerCase()
    );

    if (duplicate) {
      qs("#errCatName").textContent = "A category with this name already exists.";
      qs("#errCatName").hidden = false;
      nameField.classList.add("invalid");
      showToast("A category with this name already exists.", "error", "Duplicate category");
      return;
    }

    if (editId) {
      tracker().updateCategory(editId, { name, type, icon: selectedIcon });
      showToast("Category updated.", "success", "Categories");
    } else {
      const result = tracker().addCategory({ name, type, icon: selectedIcon });
      if (!result.ok) {
        showToast(result.reason, "error", "Categories");
        return;
      }
      showToast(`Category "${name}" added.`, "success", "Categories");
    }

    closeModal("categoryModal");
    renderFilterOptions();
    renderAll();
  }

  async function deleteCategoryFlow(id) {
    const category = tracker().getCategory(id);
    if (!category) return;

    const usage = tracker().getTransactions().filter(t => t.category === category.name).length;

    const confirmed = await confirmAction({
      title: "Delete Category?",
      message: usage
        ? `"${category.name}" is used by ${usage} entr${usage === 1 ? "y" : "ies"}. Those records will keep the old label. Continue?`
        : `"${category.name}" will be removed from your category list.`,
      confirmText: "Delete",
      danger: true
    });

    if (!confirmed) return;

    const result = tracker().deleteCategory(id);
    if (!result.ok) {
      showToast(result.reason, "error", "Categories");
      return;
    }

    showToast(`Category "${category.name}" deleted.`, "success", "Categories");
    renderFilterOptions();
    renderAll();
  }

  /* ==========================================================
     RECURRING EXPENSES
     ========================================================== */
  function advanceDueDate(dateISO, frequency) {
    if (frequency === "weekly") return Utils.addDays(dateISO, 7);

    const [year, month, day] = dateISO.split("-").map(Number);
    if (frequency === "yearly") {
      const next = new Date(year + 1, month - 1, 1);
      const lastDay = Utils.daysInMonth(next.getFullYear(), next.getMonth());
      return `${year + 1}-${String(month).padStart(2, "0")}-${String(Math.min(day, lastDay)).padStart(2, "0")}`;
    }

    const next = new Date(year, month, 1); // month is 1-based, so this lands on next month
    const lastDay = Utils.daysInMonth(next.getFullYear(), next.getMonth());
    return `${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, "0")}-${String(Math.min(day, lastDay)).padStart(2, "0")}`;
  }

  function dueLabel(item) {
    if (item.paused) return { text: "Paused", className: "" };

    const today = Utils.todayISO();
    const diff = Math.round(
      (Utils.parseDate(item.nextDue).getTime() - Utils.parseDate(today).getTime()) / 86400000
    );

    if (diff < 0) return { text: `Overdue by ${Math.abs(diff)} day${Math.abs(diff) === 1 ? "" : "s"}`, className: "overdue" };
    if (diff === 0) return { text: "Due today", className: "overdue" };
    if (diff === 1) return { text: "Due tomorrow", className: "" };
    return { text: `Due in ${diff} days`, className: "" };
  }

  function renderRecurring() {
    const items = tracker().getRecurring();
    const container = qs("#recurringList");
    const empty = qs("#recurringEmpty");
    const due = tracker().getDueRecurring();

    const banner = qs("#recurringDueBanner");
    banner.hidden = due.length === 0;
    if (due.length) {
      qs("#recurringDueText").textContent =
        `${due.length} recurring payment${due.length > 1 ? "s are" : " is"} due`;
    }

    if (!items.length) {
      container.innerHTML = "";
      empty.hidden = false;
      return;
    }

    empty.hidden = true;
    container.innerHTML = items.map(item => {
      const label = dueLabel(item);
      const frequencyLabel = item.frequency.charAt(0).toUpperCase() + item.frequency.slice(1);

      return `
        <article class="card recurring-card ${item.paused ? "paused" : ""}">
          <div class="recurring-head">
            <div class="recurring-title">
              <span class="cat-avatar">${Utils.renderCategoryIcon(tracker().getCategoryIcon(item.category))}</span>
              <div>
                <strong>${esc(item.name)}</strong>
                <span>${esc(item.category)} · ${frequencyLabel}</span>
              </div>
            </div>
            <span class="recurring-amount ${item.type}">
              ${item.type === "income" ? "+" : "-"}${Utils.formatWhole(item.amount)}
            </span>
          </div>
          <div class="recurring-meta">
            <div class="meta-box">
              <span>Next due</span>
              <strong>${Utils.formatDate(item.nextDue)}</strong>
            </div>
            <div class="meta-box">
              <span>Payment</span>
              <strong>${esc(item.paymentMethod)}</strong>
            </div>
          </div>
          <div class="recurring-foot">
            <span class="due-flag ${label.className}">
              ${iconSvg(label.className === "overdue" ? "icon-alert" : "icon-calendar")} ${label.text}
            </span>
            <div class="budget-actions">
              <button class="icon-btn sm" data-action="recurring-toggle" data-id="${item.id}"
                      aria-label="${item.paused ? "Resume" : "Pause"} ${esc(item.name)}">
                ${iconSvg(item.paused ? "icon-play" : "icon-pause")}
              </button>
              <button class="icon-btn sm" data-action="recurring-edit" data-id="${item.id}"
                      aria-label="Edit ${esc(item.name)}">${iconSvg("icon-edit")}</button>
              <button class="icon-btn sm" data-action="recurring-delete" data-id="${item.id}"
                      aria-label="Delete ${esc(item.name)}">${iconSvg("icon-trash")}</button>
            </div>
          </div>
        </article>`;
    }).join("");
  }

  function openRecurringModal(itemId = null) {
    const item = itemId ? tracker().getRecurringItem(itemId) : null;

    qs("#recEditId").value = item ? item.id : "";
    qs("#recurringModalTitle").textContent = item ? "Edit Recurring Expense" : "Add Recurring Expense";

    ["errRecName", "errRecAmount", "errRecCategory", "errRecNextDue"].forEach(id => {
      document.getElementById(id).hidden = true;
    });
    qsa("#recurringForm .field").forEach(field => field.classList.remove("invalid"));

    qs("#recName").value = item ? item.name : "";
    qs("#recAmount").value = item ? item.amount : "";
    const type = item ? item.type : "expense";
    qs("#recType").value = type;
    populateCategorySelect(qs("#recCategory"), type, item ? item.category : "");
    qs("#recFrequency").value = item ? item.frequency : "monthly";
    qs("#recNextDue").value = item ? item.nextDue : Utils.todayISO();
    qs("#recPayment").value = item ? item.paymentMethod : "Cash";
    qs("#recNote").value = item ? (item.note || "") : "";

    openModal("recurringModal");
  }

  function saveRecurring() {
    const editId = qs("#recEditId").value;

    const name = qs("#recName").value.trim();
    const amount = qs("#recAmount").value;
    const category = qs("#recCategory").value;
    const nextDue = qs("#recNextDue").value;

    let valid = true;

    const setError = (inputId, errorId, message) => {
      const input = document.getElementById(inputId);
      const error = document.getElementById(errorId);
      const field = input.closest(".field");
      if (message) {
        error.textContent = message;
        error.hidden = false;
        field.classList.add("invalid");
        valid = false;
      } else {
        error.hidden = true;
        field.classList.remove("invalid");
      }
    };

    setError("recName", "errRecName", name ? "" : "Name is required.");
    setError("recAmount", "errRecAmount",
      !amount ? "Amount is required."
        : Number(amount) <= 0 ? "Amount must be greater than zero." : "");
    setError("recCategory", "errRecCategory", category ? "" : "Please select a category.");
    setError("recNextDue", "errRecNextDue", nextDue ? "" : "Please choose a next due date.");

    if (!valid) {
      showToast("Please fix the highlighted fields.", "error", "Invalid recurring expense");
      return;
    }

    const payload = {
      name,
      amount: Number(amount),
      type: qs("#recType").value,
      category,
      frequency: qs("#recFrequency").value,
      nextDue,
      paymentMethod: qs("#recPayment").value,
      note: qs("#recNote").value.trim()
    };

    if (editId) {
      tracker().updateRecurring(editId, payload);
      showToast("Recurring expense updated.", "success", "Recurring");
    } else {
      tracker().addRecurring({ id: `rec_${Utils.uid()}`, ...payload, paused: false });
      showToast("Recurring expense added.", "success", "Recurring");
    }

    closeModal("recurringModal");
    renderAll();
  }

  async function deleteRecurringFlow(id) {
    const item = tracker().getRecurringItem(id);
    if (!item) return;

    const confirmed = await confirmAction({
      title: "Delete Recurring Expense?",
      message: `"${item.name}" will no longer be tracked as a repeating payment.`,
      confirmText: "Delete",
      danger: true
    });

    if (!confirmed) return;

    tracker().deleteRecurring(id);
    showToast("Recurring expense deleted.", "success", "Recurring");
    renderAll();
  }

  function generateDueTransactions() {
    const due = tracker().getDueRecurring();

    if (!due.length) {
      showToast("No recurring payments are due right now.", "info", "Recurring");
      return;
    }

    due.forEach(item => {
      const transaction = TransactionFactory.createTransaction({
        title: item.name,
        amount: item.amount,
        type: item.type,
        category: item.category,
        date: item.nextDue,
        paymentMethod: item.paymentMethod,
        note: item.note,
        recurring: true
      });

      tracker().addTransaction(transaction);
      tracker().updateRecurring(item.id, {
        nextDue: advanceDueDate(item.nextDue, item.frequency)
      });
    });

    showToast(
      `${due.length} entr${due.length > 1 ? "ies" : "y"} generated from recurring expenses.`,
      "success",
      "Recurring"
    );
    renderAll();
  }

  /* ==========================================================
     REPORTS
     ========================================================== */
  function renderReports() {
    const all = tracker().getTransactions();

    const series = Analytics.monthlySeries(all, currentYear, currentMonth, 6);
    Analytics.renderBar("chartReportBar", series);

    const daily = Analytics.dailySeries(all, currentYear, currentMonth);
    Analytics.renderLine("chartReportLine", daily);

    const monthList = Analytics.transactionsForMonth(all, currentYear, currentMonth);
    Analytics.renderDoughnut("chartReportDoughnut", monthList);

    renderDistribution(monthList);
    renderInsights("#reportInsights");
  }

  function renderDistribution(monthList) {
    const container = qs("#distributionList");
    const breakdown = Analytics.categoryBreakdown(monthList);

    if (!breakdown.length) {
      container.innerHTML = `<li class="mini-empty">No expenses recorded in ${Utils.monthName(currentMonth)}.</li>`;
      return;
    }

    container.innerHTML = breakdown.map(item => `
      <li class="dist-item">
        <div class="dist-row">
          <span class="dist-name"><i class="dot" style="background:${item.color}"></i> ${Utils.renderCategoryIcon(item.icon || tracker().getCategoryIcon(item.name))} ${esc(item.name)}</span>
          <span class="dist-values">${Utils.formatWhole(item.total)} <strong>${item.pct}%</strong></span>
        </div>
        <div class="dist-bar"><span style="width:${item.pct}%;background:${item.color}"></span></div>
      </li>
    `).join("");
  }

  /* ==========================================================
     SETTINGS
     ========================================================== */
  function renderSettings() {
    const snapshot = tracker().snapshot();

    const boxes = [
      { value: snapshot.transactions.length, label: "Transactions" },
      { value: snapshot.budgets.length, label: "Budgets" },
      { value: snapshot.categories.length, label: "Categories" },
      { value: snapshot.recurring.length, label: "Recurring" },
      { value: Utils.formatWhole(tracker().calculateBalance(snapshot.transactions)), label: "All-time Balance" }
    ];

    qs("#settingsStats").innerHTML = boxes.map(box => `
      <div class="stat-box">
        <strong>${box.value}</strong>
        <span>${box.label}</span>
      </div>
    `).join("");

    const theme = document.documentElement.dataset.theme || "dark";
    qsa(".seg-btn").forEach(button => {
      button.classList.toggle("active", button.dataset.themeValue === theme);
    });
  }

  /* ==========================================================
     DATA EXPORT / IMPORT / RESET / SAMPLE
     ========================================================== */
  function exportTransactions(format) {
    const stamp = Utils.todayISO();

    if (format === "csv") {
      const csv = StorageService.exportCSV();
      if (!csv) {
        showToast("There are no entries to export.", "warning", "Export");
        return;
      }
      Utils.downloadFile(`expenseflow-entries-${stamp}.csv`, csv, "text/csv;charset=utf-8;");
      showToast("CSV export downloaded.", "success", "Export");
      return;
    }

    const json = StorageService.exportJSON();
    Utils.downloadFile(`expenseflow-backup-${stamp}.json`, json, "application/json");
    showToast("JSON export downloaded.", "success", "Export");
  }

  function importTransactions(text) {
    const result = StorageService.importJSON(text);

    if (!result.ok) {
      showToast(result.error, "error", "Import failed");
      return false;
    }

    const confirmedTracker = tracker();
    confirmedTracker.hydrate(result.state);
    StorageService.saveAll(confirmedTracker.snapshot());

    renderFilterOptions();
    renderAll();
    showToast(
      `${result.state.transactions.length} entries imported successfully.`,
      "success",
      "Import"
    );
    return true;
  }

  async function loadSampleDataFlow() {
    const confirmed = await confirmAction({
      title: "Load Sample Data?",
      message: "Your current entries, budgets and recurring items will be replaced by the demo dataset.",
      confirmText: "Load Data",
      danger: false
    });

    if (!confirmed) return;

    StorageService.loadSampleData();
    renderFilterOptions();
    goToCurrentMonth();
    renderAll();
    showToast("Sample data loaded. Explore the dashboard and reports.", "success", "Demo ready");
  }

  async function resetDataFlow() {
    const confirmed = await confirmAction({
      title: "Reset All Data?",
      message: "This will permanently delete all entries, budgets, categories and recurring expenses stored in this browser.",
      confirmText: "Reset Everything",
      danger: true
    });

    if (!confirmed) return;

    StorageService.resetAll();
    searchTerm = "";
    clearFiltersQuiet();
    renderFilterOptions();
    goToCurrentMonth();
    renderAll();
    showToast("All application data has been reset.", "success", "Reset complete");
  }

  function clearFiltersQuiet() {
    filters.type = "all";
    filters.category = "all";
    filters.paymentMethod = "all";
    filters.dateRange = "all";
    filters.customFrom = "";
    filters.customTo = "";
    filters.min = "";
    filters.max = "";
    currentSort = "newest";
  }

  /* ==========================================================
     PROFILE MODULE
     ========================================================== */
  function renderProfile() {
    try {
      const profile = AuthService.getProfile();
      const session = AuthService.getSession();
      const tr = tracker();
      const transactions = tr.getTransactions();
      const balance = tr.calculateBalance(transactions);
      const budgets = tr.getBudgets();

      const dNameEl = qs("#profileDisplayNameDisplay");
      if (dNameEl) dNameEl.textContent = profile.displayName || profile.username || "User";

      const uNameEl = qs("#profileUsernameDisplay");
      if (uNameEl) uNameEl.textContent = `@${profile.username || "user"}`;

      const avBigEl = qs("#profileAvatarBig");
      if (avBigEl) avBigEl.textContent = profile.avatar || "EF";

      renderSidebarUser(profile);

      const roleBadge = qs("#profileRoleBadge");
      if (roleBadge) roleBadge.textContent = profile.role === "Verified Local User" ? "Member" : (profile.role || "Member");

      const sessionInfo = qs("#profileSessionInfo");
      if (sessionInfo) {
        if (session && session.loginAt) {
          const d = new Date(session.loginAt);
          sessionInfo.textContent = `Signed in since ${d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })} at ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
        } else {
          sessionInfo.textContent = "Session active";
        }
      }

      const inpName = qs("#profileInputName");
      if (inpName) inpName.value = profile.displayName || "";

      const inpUser = qs("#profileInputUser");
      if (inpUser) inpUser.value = profile.username || "";

      const inpCurrency = qs("#profileInputCurrency");
      if (inpCurrency) inpCurrency.value = profile.currency || "PHP";

      const txCountEl = qs("#profileTxCount");
      if (txCountEl) txCountEl.textContent = String(transactions.length);

      const balanceEl = qs("#profileBalance");
      if (balanceEl) balanceEl.textContent = Utils.formatCurrency(balance);

      const budgetsEl = qs("#profileBudgetsCount");
      if (budgetsEl) budgetsEl.textContent = String(budgets.length);
    } catch (err) {
      console.error("ExpenseFlow: renderProfile error", err);
    }
  }

  function renderSidebarUser(profile) {
    const avatar = qs("#sidebarAvatar");
    const name = qs("#sidebarUserName");
    const handle = qs("#sidebarUserHandle");
    if (avatar) avatar.textContent = profile.avatar || "EF";
    if (name) name.textContent = profile.displayName || "My Profile";
    if (handle) handle.textContent = `@${profile.username || "user"}`;
  }

  function updateAuthUI() {
    const profile = AuthService.getProfile();
    renderSidebarUser(profile);
    if (currentPage === "profile") renderProfile();
  }

  /* ==========================================================
     FAQ MODULE
     ========================================================== */
  let faqEventsBound = false;
  function renderFAQ() {
    initFAQEvents();
  }

  function initFAQEvents() {
    if (faqEventsBound) return;
    const searchInp = qs("#faqSearchInput");
    const clearBtn = qs("#faqClearSearch");
    const pills = qsa("#faqFilterPills .pill-btn");
    const cards = qsa(".tutorial-card");
    const items = qsa(".faq-item");

    if (!searchInp) return;
    faqEventsBound = true;

    function applyFAQFilter() {
      const q = (searchInp.value || "").trim().toLowerCase();
      const activePill = qs("#faqFilterPills .pill-btn.active");
      const filter = activePill ? activePill.dataset.faqFilter : "all";

      if (clearBtn) {
        clearBtn.style.display = q ? "inline-flex" : "none";
      }

      cards.forEach(card => {
        const cat = card.dataset.category || "";
        const matchesCategory = filter === "all" || cat.includes(filter);
        const matchesQuery = !q || card.textContent.toLowerCase().includes(q);
        card.style.display = (matchesCategory && matchesQuery) ? "" : "none";
      });

      items.forEach(item => {
        const cat = item.dataset.category || "";
        const matchesCategory = filter === "all" || cat.includes(filter);
        const matchesQuery = !q || item.textContent.toLowerCase().includes(q);
        item.style.display = (matchesCategory && matchesQuery) ? "" : "none";
        if (q && matchesCategory && matchesQuery) {
          item.open = true;
        }
      });
    }

    searchInp.addEventListener("input", applyFAQFilter);

    if (clearBtn) {
      clearBtn.addEventListener("click", () => {
        searchInp.value = "";
        applyFAQFilter();
        searchInp.focus();
      });
    }

    pills.forEach(pill => {
      pill.addEventListener("click", () => {
        pills.forEach(p => p.classList.remove("active"));
        pill.classList.add("active");
        applyFAQFilter();
      });
    });
  }

  /* ==========================================================
     RENDER ORCHESTRATION
     ========================================================== */
  function renderPage(page) {
    switch (page) {
      case "dashboard": renderDashboard(); break;
      case "transactions": renderTransactions(); break;
      case "budgets": renderBudgets(); break;
      case "categories": renderCategories(); break;
      case "recurring": renderRecurring(); break;
      case "reports": renderReports(); break;
      case "settings": renderSettings(); break;
      case "profile": renderProfile(); break;
      case "faq": renderFAQ(); break;
      default: break;
    }
  }

  function renderAll() {
    renderMonthLabels();
    renderHeader();
    renderNotifications();
    renderPage(currentPage);
  }

  /* ==========================================================
     PUBLIC API
     ========================================================== */
  return {
    PAGES,
    get currentPage() { return currentPage; },
    get currentMonth() { return currentMonth; },
    get currentYear() { return currentYear; },
    get searchTerm() { return searchTerm; },
    get currentSort() { return currentSort; },
    get filters() { return filters; },

    setTheme,
    toggleTheme,
    showToast,
    openModal,
    closeModal,
    closeTopModal,
    confirmAction,
    settleConfirm,

    setActivePage,
    renderHeader,
    renderMonthLabels,
    shiftMonth,
    goToCurrentMonth,
    renderNotifications,
    toggleNotifications,
    closeNotifications,
    toggleSidebar,

    populateCategorySelect,
    renderFilterOptions,

    setSearch(value) { searchTerm = value; renderTransactions(); },
    setSort(value) { currentSort = value; renderTransactions(); },
    syncFiltersFromForm,
    clearFilters,

    renderDashboard,
    renderTransactions,
    renderBudgets,
    renderCategories,
    renderRecurring,
    renderReports,
    renderSettings,
    renderProfile,
    renderFAQ,
    updateAuthUI,
    renderPage,
    renderAll,

    openTransactionModal,
    validateTransactionForm,
    saveTransaction,
    openDetails,
    deleteTransactionFlow,
    duplicateTransactionFlow,
    closeActionMenus,
    toggleActionMenu,

    openBudgetModal,
    saveBudget,
    deleteBudgetFlow,

    openCategoryModal,
    renderIconPicker,
    selectIcon,
    saveCategory,
    deleteCategoryFlow,

    openRecurringModal,
    saveRecurring,
    deleteRecurringFlow,
    generateDueTransactions,

    exportTransactions,
    importTransactions,
    loadSampleDataFlow,
    resetDataFlow
  };
})();
