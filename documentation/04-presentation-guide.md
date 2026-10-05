# 04. Oral Presentation Guide (3 Members)

**Target Presentation Time:** 8 to 10 Minutes Total (~3 Minutes per Member)

---

## 👥 Division of Roles

```
┌─────────────────────────┐  ┌─────────────────────────┐  ┌─────────────────────────┐
│        MEMBER 1         │  │        MEMBER 2         │  │        MEMBER 3         │
│   Live Product Demo     │  │ Architecture & Patterns │  │ JS Concepts & Storage   │
│   - Landing & Auth      │  │ - Modular Architecture  │  │ - Array Operations      │
│   - Entries, Budgets    │  │ - Factory Pattern       │  │ - Browser LocalStorage  │
│   - Module Tutorials    │  │ - Singleton Pattern     │  │ - AuthService & Security│
│   - FAQ & Help Center   │  │ - Strategy Pattern      │  │ - Export / JSON Backups │
└─────────────────────────┘  └─────────────────────────┘  └─────────────────────────┘
```

---

## Member 1: Live Product Demo & User Experience (~3 Minutes)

### Goal:
Showcase the running application in the browser, highlighting the user flows (student, employee, seller), the bold Neo-Brutalism design system, and new features like the module tutorials and FAQ.

### Speaking Script:
1. **Introduction & Landing Page:**
   > *"Good day, everyone! Our project is **ExpenseFlow**, a smart, privacy-first personal expense tracker built with pure HTML, CSS, and Vanilla JavaScript. We designed ExpenseFlow using a bold **Neo-Brutalism** design system—featuring high-contrast borders, tactile mechanical press interactions, and vibrant color blocking."*
   > *(Show Landing page)*: *"When users arrive, they are greeted by an intuitive landing page with direct username and password authentication. No third-party accounts, tracking, or cloud servers required. Let's sign in!"*

2. **Dashboard & Guided Tutorials:**
   > *(Show Dashboard)*: *"Here on the Dashboard, we have real-time KPI summary cards showing Total Balance, Income, and Expenses, alongside an interactive cash flow chart and category spending donut."*
   > *(Click the 'Guide' button on the toolbar)*: *"Notice our **Step-by-Step Module Guide**. For first-time users, a popup modal appears explaining the purpose, details, and controls of each component. Users can step through with 'Next' or reopen it anytime with the Guide button."*

3. **Logging an Entry & Filtering:**
   > *(Navigate to Entries)*: *"In the **Entries** module, logging a transaction is simple. Let's record a grocery run of ₱450 paid via GCash. We click '+ Add Entry', fill the title and amount, select the category, and save. The balance and charts recalculate instantly, a toast alert confirms the action, and the entry appears in our ledger. We can also use real-time search, multi-condition filters, or instant sorting."*

4. **Budgets, Recurring & FAQ:**
   > *(Show Budgets & Recurring)*: *"In **Budgets**, users can set monthly caps on specific categories with color-coded warning meters. In **Recurring**, subscriptions like Spotify or monthly rent are tracked with automatic due-date alerts and a one-click 'Generate Due' button."*
   > *(Show FAQ)*: *"Finally, our **FAQ & Help Center** provides 10+ interactive accordions and search for tutorials and tips."*
   > *(Hand off to Member 2)*: *"Now, my groupmate will explain our software architecture and the three design patterns we implemented."*

---

## Member 2: Architecture & Design Patterns (~3 Minutes)

### Goal:
Present the codebase structure, explain the modular component assembly, and walk through the Factory, Singleton, and Strategy design patterns.

### Speaking Script:
1. **Modular Architecture & Build Workflow:**
   > *"To keep our code clean, scalable, and easy to maintain, we divided our user interface into 14 modular components inside the `modules/` directory—such as `dashboard.html`, `transactions.html`, and `faq.html`. A zero-dependency build script (`scripts/build.js`) merges these modules into a single, portable `index.html` that runs 100% offline via `file://` with zero external dependencies."*

2. **The Factory Pattern (`js/transactionFactory.js`):**
   > *"For our first design pattern, we implemented the **Factory Pattern**. Instead of manually constructing raw entry objects across different files, all entries pass through `TransactionFactory.createTransaction()`. This acts as an authoritative mold, ensuring every entry has a generated UUID, normalized numbers, formatted dates, and a complete schema. We also use this factory in `duplicateTransaction()`, which creates an instant clone with a fresh ID and timestamp."*

3. **The Singleton Pattern (`js/expenseTracker.js`):**
   > *"Second is the **Singleton Pattern**. In `expenseTracker.js`, we used a JavaScript closure (IIFE) with `ExpenseTracker.getInstance()`. This ensures the entire web application shares **one central store** for all transactions, categories, and budgets. By maintaining a single source of truth, all modules stay in sync and data collisions are impossible."*

4. **The Strategy Pattern (`js/strategies.js`):**
   > *"Third is the **Strategy Pattern**. In `strategies.js`, we defined our six sorting algorithms (newest, oldest, highest, lowest, A–Z, Z–A) as interchangeable strategy functions. When a user selects an option in the UI, `applySortStrategy()` executes the chosen strategy and returns a new sorted array without mutating the original data—demonstrating the Open/Closed Principle."*
   > *(Hand off to Member 3)*: *"Next, my groupmate will explain our JavaScript core concepts, data persistence, and security."*

---

## Member 3: JS Fundamentals, LocalStorage & Security (~3 Minutes)

### Goal:
Explain modern JavaScript features, array manipulations, browser client persistence, and user data privacy.

### Speaking Script:
1. **Core JavaScript Fundamentals:**
   > *"Throughout ExpenseFlow, we applied the fundamental JavaScript concepts from Weeks 1–5. In `analytics.js` and `expenseTracker.js`, calculations for monthly balances, category distributions, and budget consumption are executed using modern array methods—specifically `.filter()`, `.map()`, and `.reduce()`. We strictly adhered to modern ES2020+ standards: utilizing `const` and `let`, template literals, arrow functions, destructuring, and optional chaining, with zero `var` keywords."*

2. **Client-Side Persistence & Authentication (`js/storage.js`):**
   > *"For data persistence, we utilized the browser's native **`localStorage`** API. State changes in the Singleton are automatically serialized to JSON across 8 dedicated keys (`ef_transactions`, `ef_budgets`, `ef_categories`, `ef_recurring`, `ef_settings`, `ef_users`, `ef_session`, and `ef_seen_guide_*`). Everything persists even if the browser tab is closed or the computer is restarted."*
   > *"Our client-side `AuthService` manages user registration and session tokens locally, verifying credentials before granting access to financial ledgers."*

3. **Data Sovereignty, Export & Backup:**
   > *"Because financial privacy is paramount, user data never leaves their local device. Under **Profile & Settings**, users have complete ownership of their data: they can **Export CSV** for Excel or Google Sheets, or **Export JSON** for offline encrypted backups. Our JSON importer features schema validation to protect against corrupted inputs."*

4. **Closing:**
   > *"Thank you very much! We are now happy to answer any questions."*

---

## 💡 Anticipated Questions & Answers (Q&A Defense Prep)

**Q1: "How does the app remember data without a backend database server?"**
> *Answer:* "We use the browser's native `localStorage` API in `js/storage.js`. All state mutations in the Singleton store are automatically serialized to JSON and stored locally under dedicated keys (`ef_transactions`, `ef_budgets`, etc.). This keeps ExpenseFlow 100% offline, private, and instant."

**Q2: "What happens when you duplicate an entry?"**
> *Answer:* "It routes through `TransactionFactory.duplicateTransaction()`. The factory reads the properties of the selected entry and passes them to `createTransaction()`, generating a brand-new unique ID (`crypto.randomUUID()`) and current timestamp so the copy never conflicts with the original record."

**Q3: "Does your sort function mutate the original array?"**
> *Answer:* "No. In `strategies.js`, each strategy spreads the array into a shallow clone using `[...transactions].sort(...)`. This guarantees that the original application state remains immutable and protected."

**Q4: "Why did you use a modular build script instead of keeping everything in one HTML file?"**
> *Answer:* "Maintaining thousands of lines of HTML in a single file causes clutter and merge conflicts. By separating each module into `modules/`, our code is modular and clean. The lightweight Node.js script (`scripts/build.js`) merges these modules into `index.html` during development, while still allowing the final output to run standalone without any server."

**Q5: "How does the step-by-step module tutorial modal work?"**
> *Answer:* "In `js/moduleGuide.js`, we maintain a structured dictionary of steps for each module. When a user visits a module for the first time, `ModuleGuide.checkFirstTime()` verifies `localStorage` and opens the tutorial modal. Users can navigate through steps with Next/Back buttons, keyboard arrows, or clickable step dots, and reopen it anytime using the toolbar 'Guide' button."

**Q6: "How is authentication handled without a server?"**
> *Answer:* "The `AuthService` in `js/storage.js` manages local account creation and validation. It checks that usernames are unique, stores password credentials in local storage, and maintains an active session object. When a user logs in, the app switches from the landing page to the main dashboard."
