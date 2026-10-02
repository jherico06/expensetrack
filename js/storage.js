/* ============================================================
   storage.js
   LOCAL STORAGE
   ------------------------------------------------------------
   Handles everything that touches localStorage:
   loading, saving, exporting (CSV / JSON), importing
   (with structure validation) and resetting application data.
   ============================================================ */

const StorageService = {

  KEYS: {
    transactions: "ef_transactions",
    budgets: "ef_budgets",
    categories: "ef_categories",
    recurring: "ef_recurring",
    settings: "ef_settings"
  },

  /* ---------- LOAD ---------- */
  loadAll() {
    const read = key => {
      try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : null;
      } catch (error) {
        console.warn(`ExpenseFlow: could not read "${key}" from localStorage.`, error);
        return null;
      }
    };

    return {
      transactions: read(this.KEYS.transactions) || [],
      budgets: read(this.KEYS.budgets) || [],
      categories: read(this.KEYS.categories) || [],
      recurring: read(this.KEYS.recurring) || [],
      settings: read(this.KEYS.settings) || null
    };
  },

  /* ---------- SAVE ---------- */
  saveAll(state) {
    const write = (key, value) => {
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch (error) {
        console.warn(`ExpenseFlow: could not write "${key}" to localStorage.`, error);
      }
    };

    write(this.KEYS.transactions, state.transactions);
    write(this.KEYS.budgets, state.budgets);
    write(this.KEYS.categories, state.categories);
    write(this.KEYS.recurring, state.recurring);
    write(this.KEYS.settings, state.settings);
  },

  /* ---------- BOOTSTRAP ---------- */
  // called once when the application starts
  bootstrap() {
    const tracker = ExpenseTracker.getInstance();
    const state = this.loadAll();

    tracker.hydrate(state);

    // first run: seed the protected default categories
    if (!tracker.getCategories().length) {
      tracker.hydrateCategories(DEFAULT_CATEGORIES.map(category => ({
        ...category,
        id: `cat_${Utils.uid()}`
      })));
      this.saveAll(tracker.snapshot());
    }

    return tracker;
  },

  /* ---------- EXPORT ---------- */
  exportJSON() {
    const snapshot = ExpenseTracker.getInstance().snapshot();
    return JSON.stringify({
      app: "ExpenseFlow",
      version: 1,
      exportedAt: new Date().toISOString(),
      transactions: snapshot.transactions,
      budgets: snapshot.budgets,
      categories: snapshot.categories,
      recurring: snapshot.recurring
    }, null, 2);
  },

  exportCSV() {
    const transactions = ExpenseTracker.getInstance().getTransactions();
    const rows = transactions.map(t => ({
      id: t.id,
      title: t.title,
      amount: t.amount,
      type: t.type,
      category: t.category,
      date: t.date,
      paymentMethod: t.paymentMethod,
      note: t.note,
      recurring: t.recurring,
      createdAt: t.createdAt
    }));
    return Utils.toCSV(rows);
  },

  /* ---------- IMPORT (validated) ---------- */
  importJSON(text) {
    let data;

    try {
      data = JSON.parse(text);
    } catch (error) {
      return { ok: false, error: "The file is not valid JSON." };
    }

    if (!data || typeof data !== "object" || Array.isArray(data)) {
      return { ok: false, error: "The file does not contain an ExpenseFlow object." };
    }

    if (!Array.isArray(data.transactions)) {
      return { ok: false, error: 'Missing required "transactions" array.' };
    }

    const validTransactions = data.transactions.every(t =>
      t && typeof t === "object" &&
      typeof t.title === "string" &&
      typeof t.amount === "number" &&
      (t.type === "income" || t.type === "expense")
    );

    if (!validTransactions) {
      return { ok: false, error: "One or more transactions have an invalid structure." };
    }

    const transactions = data.transactions.map(t => TransactionFactory.createTransaction(t));

    return {
      ok: true,
      state: {
        transactions,
        budgets: Array.isArray(data.budgets) ? data.budgets : [],
        categories: Array.isArray(data.categories) && data.categories.length
          ? data.categories
          : DEFAULT_CATEGORIES.map(category => ({ ...category, id: `cat_${Utils.uid()}` })),
        recurring: Array.isArray(data.recurring) ? data.recurring : []
      }
    };
  },

  /* ---------- RESET ---------- */
  resetAll() {
    Object.values(this.KEYS).forEach(key => localStorage.removeItem(key));

    const tracker = ExpenseTracker.getInstance();
    tracker.hydrate({
      transactions: [],
      budgets: [],
      categories: [],
      recurring: [],
      settings: { theme: tracker.getSettings().theme, sidebarCollapsed: tracker.getSettings().sidebarCollapsed }
    });

    tracker.hydrateCategories(DEFAULT_CATEGORIES.map(category => ({
      ...category,
      id: `cat_${Utils.uid()}`
    })));

    this.saveAll(tracker.snapshot());
    return tracker;
  },

  /* ---------- SAMPLE DATA ---------- */
  loadSampleData() {
    const tracker = ExpenseTracker.getInstance();
    const sample = SampleData.generate();

    tracker.hydrateTransactions(sample.transactions);
    tracker.hydrateBudgets(sample.budgets);
    tracker.hydrateRecurring(sample.recurring);
    this.saveAll(tracker.snapshot());

    return sample;
  }
};
