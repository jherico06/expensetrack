# 02. System Architecture & Setup

## How ExpenseFlow Works
ExpenseFlow is built as a **modular, client-side Single Page Application (SPA)** with a lightweight component compilation pipeline. It runs completely offline in any modern web browser without requiring a backend server, framework runtime, or cloud database.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        MODULAR SOURCE FILES                            │
│   modules/*.html (14 HTML partials: Dashboard, Entries, Modals, etc.) │
│   index.template.html (Master shell with injection markers)            │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                       node scripts/build.js (merges)
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                         STANDALONE APP SHELL                           │
│   index.html (Fully portable, runs via file:/// or http server)        │
│   Neo-Brutalism Design System · Responsive Bento Grid · Lucide Icons   │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                       User clicks & form actions
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                       EVENT ROUTER & CONTROLLER                        │
│   js/app.js (Hash Router, Delegated [data-action], Form Validation)    │
└──────────────┬────────────────────┬────────────────────┬───────────────┘
               │                    │                    │
    Creates normalized record  Interchangeable sort   Step-by-step tutorial
               ▼                    ▼                    ▼
┌───────────────────────────┐ ┌──────────────────┐ ┌────────────────────┐
│      FACTORY PATTERN      │ │ STRATEGY PATTERN │ │    MODULE GUIDE    │
│ (js/transactionFactory.js)│ │(js/strategies.js)│ │(js/moduleGuide.js) │
└──────────────┬────────────┘ └──────────┬───────┘ └────────────────────┘
               │                         │
               └────────────┬────────────┘
                            ▼
┌────────────────────────────────────────────────────────────────────────┐
│                       CENTRAL APPLICATION STORE                        │
│                SINGLETON PATTERN (js/expenseTracker.js)                │
│   - Single source of truth for transactions, categories & budgets      │
│   - Computes financial totals, category balances, and due dates        │
└──────────────┬─────────────────────────────────────────┬───────────────┘
               │                                         │
       Updates visual DOM                      Persists state automatically
               ▼                                         ▼
┌───────────────────────────┐         ┌──────────────────────────────────┐
│   PRESENTATION & CHARTS   │         │       BROWSER LOCAL STORAGE      │
│(js/ui.js & analytics.js)  │         │ (js/storage.js & AuthService)    │
│- DOM renderers & modals   │         │ - Data serialization (JSON)      │
│- Chart.js visual graphs   │         │ - User session & account storage │
└───────────────────────────┘         └──────────────────────────────────┘
```

---

## 1. Directory Structure

```text
expensetrack/
├── index.html                   # Compiled production app (runs offline via file:// or http://)
├── index.template.html          # Master shell with modular injection slots ({{MODULE:...}})
├── package.json                 # Project manifest & npm scripts (`build`, `watch`, `dev`)
├── README.md                    # Project overview, patterns guide & presentation outline
├── modules/                     # Modular HTML components (14 segmented modules)
│   ├── landing/landing.html     # Landing hero, feature highlights, sign-in & registration
│   ├── sidebar/sidebar.html     # Collapsible sidebar navigation with hamburger toggle
│   ├── topbar/topbar.html       # Application header, month navigation, theme switcher
│   ├── dashboard/dashboard.html # KPI balance cards, cash flow bar, category donut, recent entries
│   ├── transactions/transactions.html # Entries ledger, search box, advanced filters, sort dropdown
│   ├── categories/categories.html     # Category manager (expense/income), custom icon picker
│   ├── budgets/budgets.html     # Monthly overall budget meter & category budget progress bars
│   ├── recurring/recurring.html # Recurring bill templates, due banners, 1-click generator
│   ├── reports/reports.html     # Financial trend charts, period navigator, CSV/JSON export
│   ├── faq/faq.html             # Help Center, interactive accordions, search & topic filters
│   ├── about/about.html         # Project details, team credits, and feature checklist
│   ├── profile/profile.html     # User credentials form, display name, avatar, session telemetry
│   ├── settings/settings.html   # Preferences, currency selector, sample data, database reset
│   └── modals/modals.html       # Dialogs: Entry form, details, delete confirm, module guide modal
├── scripts/                     # Developer ergonomics & build automation
│   ├── build.js                 # Merges all modules/*.html into index.html
│   ├── watch.js                 # Watches modules/ for file changes and auto-rebuilds
│   └── extract.js               # Utility script for segmenting modules from template
├── css/                         # Neo-Brutalism styling architecture
│   ├── style.css                # Design tokens, color palette, cards, forms, buttons, modals
│   ├── responsive.css           # Breakpoints (desktop >1200px, tablet 768–1199px, mobile <768px)
│   └── animations.css           # Tactile micro-interactions, modal fade-ins, and button presses
├── js/                          # Modular JavaScript engine (ES6+ / IIFEs)
│   ├── utils.js                 # Currency formatters, date math, escaping, icon renderers
│   ├── transactionFactory.js    # [FACTORY PATTERN] Standardized object creation & duplication
│   ├── strategies.js            # [STRATEGY PATTERN] Interchangeable sorting algorithms
│   ├── expenseTracker.js        # [SINGLETON PATTERN] State manager & financial calculations
│   ├── storage.js               # [STORAGE & AUTH] LocalStorage serialization & AuthService
│   ├── analytics.js             # Statistical calculations & Chart.js canvas integration
│   ├── ui.js                    # DOM rendering, modal controller, toast notifications
│   ├── moduleGuide.js           # Step-by-step popup tutorial modal controller & content dictionary
│   └── app.js                   # Application bootstrap, hash router, and delegated event bus
├── data/
│   └── sampleData.js            # Realistic preloaded dataset generator for demo & testing
└── documentation/               # Course documentation & defense guides
    ├── October 1, 2026.docx     # Assignment brief and rubric
    ├── 01-project-overview.md   # Project concept, target users, and feature matrix
    ├── 02-system-architecture.md# System architecture, file layout, and storage layers
    ├── 03-design-patterns-guide.md# Factory, Singleton, and Strategy patterns in detail
    └── 04-presentation-guide.md # 3-member oral defense presentation script & anticipated Q&A
```

---

## 2. Browser Local Storage & Authentication Layer (`js/storage.js`)

Instead of requiring an external database server, ExpenseFlow utilizes the browser's native **`localStorage`** API:
* **Offline-First & Zero Latency:** Instant reads and writes with zero network latency.
* **Storage Keys Utilized:**
  * `ef_transactions`: Array of all logged income and expense records.
  * `ef_budgets`: Overall monthly limits and category-specific allocations.
  * `ef_categories`: Active default and user-created custom categories.
  * `ef_recurring`: Scheduled repeating payment definitions.
  * `ef_settings`: User preferences (currency symbol, theme mode, display options).
  * `ef_users`: Local user credentials store for secure client-side authentication.
  * `ef_session`: Active user session telemetry (username, display name, login time).
  * `ef_seen_guide_<module>`: Flags tracking whether a user has seen each module's tutorial.
* **Data Sovereignty:** Users retain 100% control over their data, with one-click **CSV export** for spreadsheets and **JSON backup / restore** with schema validation.

---

## 3. Modular Build & Development Workflow

To avoid monolithic 3,000-line HTML files while retaining 100% dependency-free browser compatibility:
1. **Source Segmentation:** Each screen and component lives in its own focused HTML file in `modules/`.
2. **Build Script (`scripts/build.js`):** A zero-dependency Node.js script reads `index.template.html` and injects each partial into its designated placeholder (e.g. `<!-- {{MODULE:DASHBOARD}} -->`).
3. **Execution Commands:**
   ```bash
   # Build the standalone index.html
   node scripts/build.js
   # or via npm
   npm run build

   # Auto-rebuild on file changes during development
   node scripts/watch.js
   # or via npm
   npm run watch
   ```
4. **Standalone Portability:** The compiled `index.html` requires no server or bundler at runtime—simply double-clicking `index.html` opens the full application in any browser.
