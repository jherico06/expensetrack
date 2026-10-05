# 03. Design Patterns Guide

The course syllabus and project rubric emphasize three foundational software design patterns: **Factory**, **Singleton**, and **Strategy**. 

Below is an easy-to-understand explanation of each pattern, the real-world analogy to use during oral defense presentations, and how each is implemented in ExpenseFlow.

---

## 1. Factory Pattern 🏭

### Where it lives:
[`js/transactionFactory.js`](file:///d:/expensetrack/js/transactionFactory.js)

### The Real-World Analogy:
Think of a **coin mint or manufacturing mold**. When creating coins, a mint stamps every single coin with the exact same dimensions, weight, and markings so that deformed or invalid coins never enter circulation.

### What problem it solves:
In ExpenseFlow, financial entries can be created through multiple pathways:
1. When a user fills out the "+ Add Entry" modal form.
2. When a user clicks "Duplicate" on an existing entry in the ledger.
3. When the recurring scheduler generates due bills automatically.

Without a factory, you would have to duplicate object-instantiation logic across multiple files, resulting in schema drift, missing fields, or inconsistent data shapes.

### How it works in our code:
`TransactionFactory.createTransaction(data)` is the **single place** where entries are created. It normalizes inputs, generates a unique UUID (with fallback), applies default values, and guarantees every entry record adheres to a strict schema:

```javascript
// js/transactionFactory.js
createTransaction(data) {
  return {
    id: (window.crypto && crypto.randomUUID)
      ? crypto.randomUUID()
      : `tx_${Date.now()}_${Math.random().toString(16).slice(2)}`,

    title: String(data.title || "").trim(),
    amount: Number(data.amount) || 0,
    type: data.type === "income" ? "income" : "expense",
    category: data.category || "Other",
    date: data.date || Utils.todayISO(),
    paymentMethod: data.paymentMethod || "Cash",
    note: data.note || "",
    recurring: Boolean(data.recurring),
    createdAt: new Date().toISOString()
  };
}
```

*Reusability via `duplicateTransaction()`:* Duplicating an entry simply routes the original data back through `createTransaction()`, which automatically generates a **brand-new ID and timestamp**, preventing primary key collisions.

---

## 2. Singleton Pattern 👑

### Where it lives:
[`js/expenseTracker.js`](file:///d:/expensetrack/js/expenseTracker.js)

### The Real-World Analogy:
Think of a **single central bank ledger** or a **single official classroom attendance book**. If two different teachers carried separate attendance books, the headcounts would disagree. There must only ever be **one official source of truth**.

### What problem it solves:
Multiple application modules (the Dashboard KPI cards, Entries table, Budgets progress meters, Reports analytics, and Chart.js graphs) all need to read and update financial data simultaneously. If different modules instantiated their own store, data would quickly fall out of sync, leading to conflicting totals and corrupted local storage.

The Singleton pattern ensures the entire application shares **one global instance**.

### How it works in our code:
We use a JavaScript closure (IIFE) that encapsulates a private `instance` reference. Calling `ExpenseTracker.getInstance()` creates the manager on the first call, and returns that exact same manager on every subsequent call:

```javascript
// js/expenseTracker.js
const ExpenseTracker = (() => {
  let instance; // Private reference encapsulated in closure

  function createInstance() {
    // Private application state
    let transactions = [];
    let budgets = [];
    let categories = [];
    let recurring = [];
    let settings = { theme: "dark", sidebarCollapsed: false };

    return {
      getTransactions() { return [...transactions]; },
      addTransaction(t) { transactions.unshift(t); persist(); },
      calculateTotals(list) { /* ... */ },
      // Other CRUD & financial calculation methods
    };
  }

  return {
    // Public access point: returns the single instance
    getInstance() {
      if (!instance) instance = createInstance();
      return instance;
    }
  };
})();
```

*Auto-Persistence:* Every state mutation in the Singleton automatically invokes `StorageService.saveAll()`, ensuring that user data is persisted to `localStorage` immediately.

---

## 3. Strategy Pattern 🧭

### Where it lives:
[`js/strategies.js`](file:///d:/expensetrack/js/strategies.js)

### The Real-World Analogy:
Think of **Google Maps or Waze**. When navigating to a destination, you can toggle between **"Fastest route"**, **"Shortest distance"**, or **"Avoid tolls"**. You change the *routing strategy*, but your vehicle, starting point, and map engine remain identical.

### What problem it solves:
Without this pattern, developers often resort to bloated `switch` or `if/else` chains inside rendering functions to handle sorting dropdowns. Adding a new sorting rule requires modifying and risking breaking the existing conditional logic (violating the Open/Closed Principle).

With the Strategy pattern, sorting algorithms are encapsulated as interchangeable, pure functions in a strategy catalog.

### How it works in our code:
Six sorting strategies live side by side as pure functions:

```javascript
// js/strategies.js
const SortStrategies = {
  newest:  txs => [...txs].sort((a, b) => Utils.compareDates(b.date, a.date)),
  oldest:  txs => [...txs].sort((a, b) => Utils.compareDates(a.date, b.date)),
  highest: txs => [...txs].sort((a, b) => b.amount - a.amount),
  lowest:  txs => [...txs].sort((a, b) => a.amount - b.amount),
  az:      txs => [...txs].sort((a, b) => a.title.localeCompare(b.title)),
  za:      txs => [...txs].sort((a, b) => b.title.localeCompare(a.title))
};

function applySortStrategy(strategyName, transactions) {
  const strategy = SortStrategies[strategyName];
  return typeof strategy === "function" ? strategy(transactions) : [...transactions];
}
```

*Context & Immutability:* The UI simply changes the active strategy name (`state.currentSort`). The context function `applySortStrategy()` executes the selected strategy and returns a **new sorted array** without mutating the original dataset. Adding a seventh sorting rule requires adding just one function to `SortStrategies` without touching UI or rendering logic.
