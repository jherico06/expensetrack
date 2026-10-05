# 04. Oral Presentation Guide (3 Members)

**Target Presentation Time:** 8 to 10 Minutes Total (~3 Minutes per Member)

---

## 👥 Division of Roles

```
┌─────────────────────────┐  ┌─────────────────────────┐  ┌─────────────────────────┐
│        MEMBER 1         │  │        MEMBER 2         │  │        MEMBER 3         │
│   Live Product Demo     │  │ Architecture & Patterns │  │ JS Concepts & Storage   │
│   - UI walkthrough      │  │ - Factory Pattern       │  │ - Arrays & Functions    │
│   - Student/Seller flows│  │ - Singleton Pattern     │  │ - SQLite Local Storage  │
│   - Add transaction     │  │ - Strategy Pattern      │  │ - Export / Backup       │
└─────────────────────────┘  └─────────────────────────┘  └─────────────────────────┘
```

---

## Member 1: Live Product Demo & Concept (~3 Minutes)

### Goal:
Show the working application in the browser and demonstrate how it covers students, employees, and sellers.

### Speaking Script:
1. **Introduction:**
   > *"Good day, everyone! Our project is **ExpenseFlow**, a smart personal expense tracker designed to cover all types of users—from students managing their daily allowance, to employees budgeting monthly salaries and bills, to online sellers monitoring business cash flow."*
2. **Dashboard Overview:**
   > *"Let's open the app. Under **Settings**, we can click **Load Sample Data** to see a full financial month. Here on the Dashboard, we have our Available Balance, our Monthly Budget Ring that visually warns us when spending gets too high, and a Doughnut chart showing spending distribution by category."*
3. **Adding a Transaction:**
   > *"Now let's add a transaction. Suppose a student buys school supplies for ₱350 via GCash. We click 'Add Transaction', fill in the details, and hit Save. Notice that the balance updates instantly, a toast alert confirms the save, and the transaction immediately appears in our history."*
4. **Budgets & Recurring:**
   > *"We also have a **Budgets** view where you can set caps on specific categories like Food or Transportation. In the **Recurring** view, subscriptions like Netflix or monthly WiFi bills are tracked with automated alerts whenever a payment is due."*
   > *(Hand off to Member 2)*: *"Now, my groupmate will explain the software architecture and the three design patterns we implemented."*

---

## Member 2: Architecture & Design Patterns (~3 Minutes)

### Goal:
Show the code editor and explain how the Factory, Singleton, and Strategy design patterns were applied.

### Speaking Script:
1. **Introduction:**
   > *"To keep our codebase clean, maintainable, and aligned with the course syllabus, we implemented three classic design patterns: Factory, Singleton, and Strategy."*
2. **The Factory Pattern (`js/transactionFactory.js`):**
   > *"First is the **Factory Pattern**. Instead of creating raw transaction objects scattered all over the code, everything goes through `TransactionFactory.createTransaction()`. This acts like a mold, guaranteeing that every transaction has a generated UUID, a normalized amount, a valid date, and a complete schema. We also use this factory when duplicating transactions."*
3. **The Singleton Pattern (`js/expenseTracker.js`):**
   > *"Second is the **Singleton Pattern**. In `expenseTracker.js`, we used a private closure with `getInstance()`. This ensures that our entire application only ever has **one central manager** holding the application state. It serves as our single source of truth across all views and prevents data conflicts."*
4. **The Strategy Pattern (`js/strategies.js`):**
   > *"Third is the **Strategy Pattern**. In `strategies.js`, we defined our six sorting rules (newest, oldest, highest amount, lowest amount, A–Z, Z–A) as independent strategy functions. When the user changes the sort dropdown, `applySortStrategy()` picks the right function at runtime and returns a new sorted array without mutating original data."*
   > *(Hand off to Member 3)*: *"Next, my groupmate will explain our JavaScript fundamentals and our local storage setup."*

---

## Member 3: JS Fundamentals, Local Storage & Data Safety (~3 Minutes)

### Goal:
Explain array operations, data persistence with browser localStorage, and data safety.

### Speaking Script:
1. **JavaScript Core Concepts:**
   > *"Throughout our code, we heavily utilized the core lessons from Weeks 1–5. In `analytics.js`, all of our totals, category distributions, and financial insights are calculated using modern array methods—specifically `.filter()`, `.map()`, and `.reduce()`. We strictly adhered to modern ES6+ syntax: using `const` and `let`, template literals, arrow functions, and destructuring with zero `var` keywords."*
2. **Client-Side Persistence (`localStorage`):**
   > *"For data persistence, we utilized browser **`localStorage`** in `js/storage.js`. It requires zero installations or external servers. Every time a transaction, budget, or category is updated, the Singleton automatically serializes the data into five dedicated storage keys. Even if you close the browser, your data is preserved."*
3. **Data Safety, Export & Import:**
   > *"Under **Settings**, users have full ownership of their data. They can **Export to CSV** to open their records in Microsoft Excel or Google Sheets, or **Export/Import JSON** for quick backups. We even added schema validation on JSON imports to prevent corrupted files from loading."*
4. **Closing:**
   > *"Thank you very much! We are now open for any questions."*

---

## 💡 Anticipated Questions & Answers (Q&A Prep)

**Q1: "How does the app remember data without a database server?"**
> *Answer:* "We use the browser's native `localStorage` API in `js/storage.js`. The state is serialized to JSON and automatically persisted after every change, keeping the application lightweight, fast, and 100% offline."

**Q2: "What happens if you duplicate a transaction?"**
> *Answer:* "It runs through `TransactionFactory.duplicateTransaction()`. The factory takes the original data but generates a brand-new unique ID and timestamp, preventing ID collisions."

**Q3: "Does your sort function change the original array?"**
> *Answer:* "No. In `strategies.js`, we spread the array into a new one using `[...transactions].sort(...)`. This keeps our original state safe and immutable."
