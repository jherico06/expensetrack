# 02. System Architecture & Setup

## How ExpenseFlow Works
ExpenseFlow is built as a **pure client-side Single Page Application (SPA)**. It runs directly in the user's browser without requiring a backend server, runtime compiler, or external database installation.

```
┌────────────────────────────────────────────────────────┐
│                   USER INTERFACE                       │
│   (index.html · Bento Grid · Modals & Dialogs)         │
└───────────────────────────┬────────────────────────────┘
                            │
               User clicks & form inputs
                            ▼
┌────────────────────────────────────────────────────────┐
│              CONTROLLER & EVENT ROUTING                │
│   (js/app.js · Hash Router & Action Dispatcher)        │
└─────────────┬───────────────────────────┬──────────────┘
              │                           │
   Creates normalized object    Interchangeable sort
              ▼                           ▼
┌───────────────────────────┐ ┌──────────────────────────┐
│     FACTORY PATTERN       │ │    STRATEGY PATTERN      │
│ (js/transactionFactory.js)│ │     (js/strategies.js)   │
└─────────────┬─────────────┘ └───────────┬──────────────┘
              │                           │
              └─────────────┬─────────────┘
                            ▼
┌────────────────────────────────────────────────────────┐
│              CENTRAL APPLICATION STORE                 │
│         SINGLETON PATTERN (js/expenseTracker.js)       │
│  - One source of truth for transactions & budgets      │
│  - Executes financial calculations and totals          │
└─────────────┬───────────────────────────┬──────────────┘
              │                           │
     Updates visual DOM          Persists state automatically
              ▼                           ▼
┌───────────────────────────┐ ┌──────────────────────────┐
│     PRESENTATION & CHARTS │ │   BROWSER LOCAL STORAGE  │
│  (js/ui.js & analytics.js)│ │      (js/storage.js)     │
└───────────────────────────┘ └──────────────────────────┘
```

---

## 1. Directory Structure

```text
expensetrack/
├── index.html                   # Application entry point & modal definitions
├── README.md                    # Quickstart guide & presentation overview
├── css/
│   ├── style.css                # Design tokens, glassmorphism, bento grid
│   ├── responsive.css           # Breakpoints (desktop, tablet, mobile)
│   └── animations.css           # Smooth entrances & micro-interactions
├── js/
│   ├── utils.js                 # Helper functions (currency, dates, validation)
│   ├── transactionFactory.js    # [FACTORY PATTERN] Object creation
│   ├── strategies.js            # [STRATEGY PATTERN] Sorting algorithms
│   ├── expenseTracker.js        # [SINGLETON PATTERN] State manager & calculations
│   ├── storage.js               # [LOCAL STORAGE] Persistent data layer
│   ├── analytics.js             # Statistical calculations & Chart.js adapter
│   ├── ui.js                    # DOM rendering, toasts, modal handlers
│   └── app.js                   # Hash router & delegated event listeners
├── data/
│   └── sampleData.js            # Presentation mock dataset generator
└── documentation/               # Assignment documentation & oral defense guides
    ├── October 1, 2026.docx     # Teacher's project prompt
    ├── 01-project-overview.md   # Project concept & feature overview
    ├── 02-system-architecture.md# This architecture & setup guide
    ├── 03-design-patterns-guide.md# Factory, Singleton & Strategy breakdown
    └── 04-presentation-guide.md # 3-member presentation script & defense prep
```

---

## 2. Browser Local Storage Layer (`js/storage.js`)

Instead of requiring an external database server, the application uses the browser's built-in **`localStorage`**:
* **Persistent:** Data stays saved even when the browser is closed or refreshed.
* **Keys Used:**
  * `ef_transactions`: Array of all user transactions.
  * `ef_budgets`: Overall monthly limits and category budgets.
  * `ef_categories`: Default and custom user categories.
  * `ef_recurring`: Scheduled recurring templates.
  * `ef_settings`: UI theme (dark/light) and preferences.
* **Portability:** Users can export all their data to a **JSON** backup file or a **CSV** spreadsheet at any time.

---

## 3. Why Pure Client-Side is Ideal for This Project

1. **Zero-Friction Grading:** The instructor can download the folder from Google Drive and **double-click `index.html`** to start testing immediately.
2. **Zero Dependencies:** No `node_modules/` folder, no port conflicts, and no installation commands needed.
3. **100% Curriculum-Aligned:** Directly implements Weeks 1–5 JavaScript concepts (Variables, Arrays, Objects, Functions, DOM, LocalStorage, Design Patterns).
