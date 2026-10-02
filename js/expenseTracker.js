/* ============================================================
   expenseTracker.js
   SINGLETON DESIGN PATTERN
   ------------------------------------------------------------
   ExpenseTracker is the one centralized manager of the whole
   application. It owns every data collection (transactions,
   budgets, categories, recurring items, settings), exposes all
   CRUD operations and financial calculations, and persists the
   state through the LOCAL STORAGE module after each change.

   Only one instance may ever exist:
     const tracker = ExpenseTracker.getInstance();
   ============================================================ */

// Default categories seeded on first run
const DEFAULT_CATEGORIES = [
  { name: "Food",          type: "expense", icon: "🍔", isDefault: true },
  { name: "Transportation",type: "expense", icon: "🚗", isDefault: true },
  { name: "School",        type: "expense", icon: "📚", isDefault: true },
  { name: "Bills",         type: "expense", icon: "🧾", isDefault: true },
  { name: "Shopping",      type: "expense", icon: "🛍️", isDefault: true },
  { name: "Entertainment", type: "expense", icon: "🎬", isDefault: true },
  { name: "Health",        type: "expense", icon: "🏥", isDefault: true },
  { name: "Personal",      type: "expense", icon: "💇", isDefault: true },
  { name: "Subscription",  type: "expense", icon: "📱", isDefault: true },
  { name: "Travel",        type: "expense", icon: "✈️", isDefault: true },
  { name: "Other",         type: "expense", icon: "📦", isDefault: true },
  { name: "Salary",        type: "income",  icon: "💼", isDefault: true },
  { name: "Allowance",     type: "income",  icon: "🎒", isDefault: true },
  { name: "Freelance",     type: "income",  icon: "💻", isDefault: true },
  { name: "Business",      type: "income",  icon: "🏢", isDefault: true },
  { name: "Gift",          type: "income",  icon: "🎁", isDefault: true },
  { name: "Other Income",  type: "income",  icon: "💰", isDefault: true }
];

const ExpenseTracker = (() => {

  let instance;

  function createInstance() {

    // ---------- VARIABLES AND APPLICATION STATE ----------
    let transactions = [];
    let budgets = [];
    let categories = [];
    let recurring = [];
    let settings = {
      theme: "dark",
      sidebarCollapsed: false
    };

    // save current state through the LOCAL STORAGE module
    function persist() {
      StorageService.saveAll({ transactions, budgets, categories, recurring, settings });
    }

    function findById(list, id) {
      return list.find(item => item.id === id);
    }

    function replaceById(list, id, patch) {
      const index = list.findIndex(item => item.id === id);
      if (index === -1) return null;
      list[index] = { ...list[index], ...patch };
      return list[index];
    }

    return {

      /* ---------- TRANSACTIONS ---------- */
      getTransactions() {
        return transactions;
      },

      getTransaction(id) {
        return findById(transactions, id);
      },

      hydrateTransactions(list) {
        transactions = Array.isArray(list) ? list : [];
      },

      addTransaction(transaction) {
        transactions.push(transaction);
        persist();
        return transaction;
      },

      updateTransaction(id, patch) {
        const updated = replaceById(transactions, id, patch);
        if (updated) persist();
        return updated;
      },

      deleteTransaction(id) {
        const before = transactions.length;
        transactions = transactions.filter(transaction => transaction.id !== id);
        const removed = transactions.length !== before;
        if (removed) persist();
        return removed;
      },

      duplicateTransaction(id) {
        const original = findById(transactions, id);
        if (!original) return null;
        const copy = TransactionFactory.duplicateTransaction(original);
        transactions.push(copy);
        persist();
        return copy;
      },

      /* ---------- BUDGETS ---------- */
      getBudgets() {
        return budgets;
      },

      hydrateBudgets(list) {
        budgets = Array.isArray(list) ? list : [];
      },

      getMonthlyBudget(monthKeyValue) {
        return budgets.find(b => b.scope === "monthly" && b.month === monthKeyValue) || null;
      },

      getCategoryBudgets(monthKeyValue) {
        return budgets.filter(b => b.scope === "category" && b.month === monthKeyValue);
      },

      getBudget(id) {
        return findById(budgets, id);
      },

      addBudget(budget) {
        if (budget.scope === "monthly") {
          const existing = this.getMonthlyBudget(budget.month);
          if (existing) {
            existing.limit = budget.limit;
            persist();
            return existing;
          }
        }
        budgets.push(budget);
        persist();
        return budget;
      },

      updateBudget(id, patch) {
        const updated = replaceById(budgets, id, patch);
        if (updated) persist();
        return updated;
      },

      deleteBudget(id) {
        const before = budgets.length;
        budgets = budgets.filter(budget => budget.id !== id);
        const removed = budgets.length !== before;
        if (removed) persist();
        return removed;
      },

      /* ---------- CATEGORIES ---------- */
      getCategories() {
        return categories;
      },

      hydrateCategories(list) {
        categories = Array.isArray(list) ? list : [];
      },

      getCategoriesByType(type) {
        return categories.filter(category => category.type === type);
      },

      getCategory(id) {
        return findById(categories, id);
      },

      getCategoryIcon(name) {
        const category = categories.find(c => c.name === name);
        return category ? category.icon : "📦";
      },

      addCategory(category) {
        const duplicate = categories.some(c =>
          c.type === category.type && c.name.toLowerCase() === category.name.toLowerCase()
        );
        if (duplicate) return { ok: false, reason: "A category with this name already exists." };
        const newCategory = {
          ...category,
          id: `cat_${Utils.uid()}`,
          isDefault: false
        };
        categories.push(newCategory);
        persist();
        return { ok: true, category: newCategory };
      },

      updateCategory(id, patch) {
        const updated = replaceById(categories, id, patch);
        if (updated) persist();
        return updated;
      },

      deleteCategory(id) {
        const category = findById(categories, id);
        if (!category) return { ok: false, reason: "Category not found." };
        if (category.isDefault) {
          return { ok: false, reason: "Default categories cannot be deleted." };
        }
        categories = categories.filter(item => item.id !== id);
        persist();
        return { ok: true };
      },

      /* ---------- RECURRING ---------- */
      getRecurring() {
        return recurring;
      },

      hydrateRecurring(list) {
        recurring = Array.isArray(list) ? list : [];
      },

      getRecurringItem(id) {
        return findById(recurring, id);
      },

      addRecurring(item) {
        recurring.push(item);
        persist();
        return item;
      },

      updateRecurring(id, patch) {
        const updated = replaceById(recurring, id, patch);
        if (updated) persist();
        return updated;
      },

      deleteRecurring(id) {
        const before = recurring.length;
        recurring = recurring.filter(item => item.id !== id);
        const removed = recurring.length !== before;
        if (removed) persist();
        return removed;
      },

      getDueRecurring() {
        const today = Utils.todayISO();
        return recurring.filter(item => !item.paused && item.nextDue <= today);
      },

      /* ---------- SETTINGS ---------- */
      getSettings() {
        return settings;
      },

      hydrateSettings(patch) {
        settings = { ...settings, ...(patch || {}) };
      },

      updateSettings(patch) {
        settings = { ...settings, ...patch };
        persist();
        return settings;
      },

      /* ---------- FINANCIAL CALCULATIONS ---------- */
      calculateIncome(list = transactions) {
        return list
          .filter(t => t.type === "income")
          .reduce((sum, t) => sum + t.amount, 0);
      },

      calculateExpenses(list = transactions) {
        return list
          .filter(t => t.type === "expense")
          .reduce((sum, t) => sum + t.amount, 0);
      },

      calculateBalance(list = transactions) {
        return this.calculateIncome(list) - this.calculateExpenses(list);
      },

      // returns [{ name, total, count }] sorted from highest to lowest
      calculateCategoryTotals(list = transactions) {
        const totals = list
          .filter(t => t.type === "expense")
          .reduce((acc, transaction) => {
            acc[transaction.category] = (acc[transaction.category] || 0) + transaction.amount;
            return acc;
          }, {});

        return Object.keys(totals)
          .map(name => ({
            name,
            total: totals[name],
            count: list.filter(t => t.type === "expense" && t.category === name).length
          }))
          .sort((a, b) => b.total - a.total);
      },

      calculateBudgetUsage(limit, spent) {
        if (!limit) return 0;
        return Math.round((spent / limit) * 100);
      },

      // state label for a usage percentage
      budgetState(percent) {
        if (percent >= 100) return "exceeded";
        if (percent >= 80) return "warning";
        if (percent >= 51) return "moderate";
        return "safe";
      },

      /* ---------- HYDRATION & STATE ---------- */
      hydrate(state = {}) {
        this.hydrateTransactions(state.transactions);
        this.hydrateBudgets(state.budgets);
        this.hydrateCategories(state.categories);
        this.hydrateRecurring(state.recurring);
        this.hydrateSettings(state.settings);
      },

      snapshot() {
        return { transactions, budgets, categories, recurring, settings };
      },

      persist
    };
  }

  return {
    // the single access point of the Singleton
    getInstance() {
      if (!instance) {
        instance = createInstance();
      }
      return instance;
    }
  };
})();
