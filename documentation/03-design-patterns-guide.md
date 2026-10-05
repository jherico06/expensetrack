# 03. Design Patterns Guide

Your instructor's rubric specifically requires three classic software design patterns: **Factory**, **Singleton**, and **Strategy**. 

Below is an easy-to-understand explanation of each pattern, the real-world analogy to use during your presentation, and where it lives in your code.

---

## 1. Factory Pattern 🏭

### Where it lives:
[`js/transactionFactory.js`](file:///d:/expensetrack/js/transactionFactory.js)

### The Real-World Analogy:
Think of a **factory mold**. When making coins, a coin factory stamps every single coin with the exact same weight, edges, and thickness so that no deformed coins enter circulation.

### What problem it solves:
In an expense tracker, transactions can be created in several ways:
1. When a user fills out the "Add Transaction" form.
2. When a user clicks "Duplicate" on an existing transaction.
3. When the recurring scheduler generates due bills automatically.

Without a factory, you would have to write object-creation code in multiple places, which leads to typos, missing fields, or broken data.

### How it works in our code:
`TransactionFactory.createTransaction(data)` is the **single place** where transactions are created. It guarantees that every transaction object always has the complete, correct structure:

```javascript
// js/transactionFactory.js
createTransaction(data) {
  return {
    id: crypto.randomUUID(),          // Unique ID
    title: String(data.title).trim(), // Clean string
    amount: Number(data.amount) || 0, // Valid number
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

---

## 2. Singleton Pattern 👑

### Where it lives:
[`js/expenseTracker.js`](file:///d:/expensetrack/js/expenseTracker.js)

### The Real-World Analogy:
Think of a **single classroom attendance record** or a **single cash register in a small store**. You don't want two different logbooks, because teachers would record different numbers and the totals would clash. There must only ever be **one official source of truth**.

### What problem it solves:
Multiple components (the dashboard balance cards, transaction table, budget ring, recent activity, and Chart.js graphs) all need to read and update data. If they each created their own instance of the tracker, your data would go out of sync and cause conflicting balances. 

The Singleton pattern ensures the whole application reads from and writes to **one single store**.

### How it works in our code:
We use a JavaScript closure (IIFE) that hides the `instance` variable. Calling `ExpenseTracker.getInstance()` creates the manager once, and every subsequent call returns that exact same manager:

```javascript
// js/expenseTracker.js
const ExpenseTracker = (() => {
  let instance; // Private variable hidden inside closure

  function createInstance() {
    let transactions = []; // Private store
    return {
      getTransactions() { return transactions; },
      addTransaction(t) { transactions.push(t); persist(); }
    };
  }

  return {
    // Only one instance is ever created
    getInstance() {
      if (!instance) instance = createInstance();
      return instance;
    }
  };
})();
```

---

## 3. Strategy Pattern 🧭

### Where it lives:
[`js/strategies.js`](file:///d:/expensetrack/js/strategies.js)

### The Real-World Analogy:
Think of **Google Maps or Waze**. When you enter a destination, you can switch routes: **"Fastest"**, **"Shortest"**, or **"Avoid Tolls"**. You change the *strategy*, but your car, passengers, and map stay the same.

### What problem it solves:
Beginners usually write long, messy `if/else` or `switch` statements whenever a user selects a sort option in a dropdown. If you want to add a new sorting rule later, you would have to edit and risk breaking that long `if/else` chain.

With the Strategy pattern, each sorting algorithm is a standalone function stored in a dictionary.

### How it works in our code:
Six sorting rules live as interchangeable strategies:

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
When the user picks an option in the UI, we simply call `applySortStrategy("highest", transactions)`. It returns a **new sorted array** without modifying or mutating the original data!
