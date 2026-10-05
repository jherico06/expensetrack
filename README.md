# ExpenseFlow — Smart Personal Expense Tracker

A complete, dependency-light personal finance dashboard built with **HTML5, Vanilla CSS3, and Vanilla JavaScript (ES2020+)** for our Weeks 1–5 group project. Built using a bold **Neo-Brutalism (Neubrutalism)** design system, fully responsive across desktop, tablet, and mobile, with local client persistence through `localStorage`, interactive data visualization via Chart.js, and a modular architecture.

> **Zero installation required to run:** Simply open `index.html` in any modern web browser — no build step, server, or database installation needed.

---

## 1. Features & Modules

| Module | What it does |
|---|---|
| **Landing & Auth** | Clean introductory landing page with direct username and password authentication, registration tab, show/hide password visibility toggle, and instant validation. |
| **Dashboard** | Real-time financial summary: Net Balance, Income, Expenses, month selector, interactive cash flow and category charts, and recent activity ledger. |
| **Entries** | Complete financial history table, live keyword search, advanced multi-criteria filters (type, category, payment method, date range, amount bounds), 6 sorting strategies, and row actions (View, Edit, Duplicate, Delete). |
| **Budgets** | Overall monthly spending ceiling + category-specific budget cards with progress meters and color-coded threshold alerts (Safe `<70%`, Caution `70–99%`, Over-budget `100%+`). |
| **Categories** | Full CRUD category management (11 default expense + 6 default income categories), custom category creator, and a 24-icon Neo-Brutalism SVG picker. |
| **Recurring** | Automated recurring payments (daily, weekly, bi-weekly, monthly, yearly), due-date alert banners, and a one-click "Generate Due" batch posting button. |
| **Reports** | Period-scoped spending trend graphs, category distribution donut chart, and data export (CSV for spreadsheets and JSON for backups). |
| **FAQ & Guide** | In-app Help Center with live keyword search, topic filter pills, and 10+ expandable step-by-step tutorial accordions. |
| **Profile** | User account management, display name, username handle, initials avatar, active session telemetry, theme switcher, and currency selector. |
| **Settings** | Theme mode (Dark / Light), currency formatting (₱, $, €, £, ¥), sample demo data loader, and clean database wipe. |
| **About** | Project overview, technical specifications, and group member credits. |
| **Module Tutorials** | Interactive step-by-step popup tutorial modal for every module, introducing components to first-time users with on-demand replay via toolbar buttons. |

### Cross-cutting Features
* **Design Patterns:** Factory (`TransactionFactory`), Singleton (`ExpenseTracker`), and Strategy (`SortStrategies`).
* **Design System:** Neo-Brutalism UI with high-contrast borders (2–3px), crisp zero-blur offset drop shadows (3–8px), vibrant color blocking, and tactile mechanical press animations.
* **100% Offline & Private:** Client-side persistence via browser `localStorage` across 8 dedicated keys. Zero cloud tracking, zero external database servers.
* **Accessibility:** Semantic HTML5, ARIA labels, focus-visible rings, keyboard shortcuts (`Esc` closes modals, `N` opens Add Entry, Arrow keys navigate tutorials).
* **Responsive Layout:** Adaptive desktop, tablet, and mobile views with collapsible drawer sidebar and hamburger toggle.

---

## 2. Getting Started

### Option A: Run Directly (No Setup)
Simply double-click **`index.html`** or open it in any modern browser (Chrome, Edge, Firefox, Safari).
* Works immediately from `file:///` — **zero server, zero bundler, zero installation required**.

### Option B: Developer Workflow (Modular Build)
If you wish to edit modular components inside `modules/`:
```bash
# 1. Compile modular files into index.html
node scripts/build.js
# or via npm
npm run build

# 2. Watch for file changes and auto-compile
node scripts/watch.js
# or via npm
npm run watch
```

---

## 3. Project Structure

```text
expensetrack/
├── index.html                   # Standalone compiled application (runs 100% offline)
├── index.template.html          # Master HTML template with modular injection slots
├── package.json                 # Project scripts (`npm run build`, `npm run watch`, `npm run dev`)
├── README.md                    # Project documentation & presentation guide
├── modules/                     # Segmented HTML component modules (14 partials)
│   ├── landing/landing.html     # Landing hero, features, sign-in & registration forms
│   ├── sidebar/sidebar.html     # Collapsible sidebar navigation & hamburger toggle
│   ├── topbar/topbar.html       # Application header, month navigation, theme switcher
│   ├── dashboard/dashboard.html # KPI balance cards, cash flow bar, category donut, recent entries
│   ├── transactions/transactions.html # Entries ledger, search bar, advanced filters, sorting
│   ├── categories/categories.html     # Category manager (expense/income) & icon picker
│   ├── budgets/budgets.html     # Monthly overall budget & category budget progress meters
│   ├── recurring/recurring.html # Recurring bill templates, due banners, batch generator
│   ├── reports/reports.html     # Financial charts, period filter, CSV/JSON export
│   ├── faq/faq.html             # Help Center, interactive accordions, search & topic filters
│   ├── about/about.html         # Project description, tech stack, feature checklist
│   ├── profile/profile.html     # User credentials form, display name, avatar, session info
│   ├── settings/settings.html   # Preferences, currency selector, sample data, database reset
│   └── modals/modals.html       # Dialogs: Entry form, details, confirm, module guide modal
├── scripts/                     # Build & developer automation scripts
│   ├── build.js                 # Merges all modules/*.html into index.html
│   ├── watch.js                 # Watches modules/ for file changes and auto-rebuilds
│   └── extract.js               # Utility script for segmenting modules from template
├── css/                         # Neo-Brutalism styling architecture
│   ├── style.css                # Design tokens, color palette, surfaces, cards, buttons, modals
│   ├── responsive.css           # Breakpoints (desktop >1200px, tablet 768–1199px, mobile <768px)
│   └── animations.css           # Tactile button presses, modal transitions, and micro-interactions
├── js/                          # Modular JavaScript engine (ES6+ / IIFEs)
│   ├── utils.js                 # Currency formatters, date utilities, HTML escaping, icon renderers
│   ├── transactionFactory.js    # [FACTORY PATTERN] Object creation & duplication
│   ├── strategies.js            # [STRATEGY PATTERN] Interchangeable sorting algorithms
│   ├── expenseTracker.js        # [SINGLETON PATTERN] State manager & financial calculations
│   ├── storage.js               # [STORAGE & AUTH] LocalStorage persistence layer & AuthService
│   ├── analytics.js             # Statistical calculations & Chart.js canvas wrapper
│   ├── ui.js                    # DOM rendering, modal controller, toast notifications
│   ├── moduleGuide.js           # Step-by-step popup tutorial modal controller & content dictionary
│   └── app.js                   # Application bootstrap, hash router, and delegated event bus
├── data/
│   └── sampleData.js            # Realistic preloaded dataset generator for demo & testing
└── documentation/               # Course documentation & oral defense guides
    ├── October 1, 2026.docx     # Assignment brief and rubric
    ├── 01-project-overview.md   # Project concept, target users, and feature matrix
    ├── 02-system-architecture.md# System architecture, file layout, and storage layers
    ├── 03-design-patterns-guide.md# Factory, Singleton, and Strategy patterns in detail
    └── 04-presentation-guide.md # 3-member oral defense presentation script & anticipated Q&A
```

---

## 4. JavaScript Concepts & Design Patterns

### Concepts Checklist

| Concept | Where it is used |
|---|---|
| **Variables & Application State** | `js/ui.js` state block (`currentPage`, `currentMonth`, `filters`, `currentSort`) and private state inside the Singleton (`transactions`, `budgets`, `categories`, `recurring`, `settings`) in `js/expenseTracker.js`. |
| **Objects** | `Utils`, `TransactionFactory`, `SortStrategies`, `StorageService`, `AuthService`, `ModuleGuide`, `Analytics`, `SampleData`. |
| **Arrays** | All financial collections are manipulated using modern array methods: `map`, `filter`, `reduce`, `find`, `findIndex`, `sort`, and `slice` (totals, breakdowns, insights, rendering). |
| **Functions** | Named functions, arrow functions, higher-order functions (`applySortStrategy`, render callbacks), IIFE closures building Singletons, and Promise-based confirmation dialogs. |
| **DOM Manipulation** | Pure vanilla DOM operations in `js/ui.js`: `innerHTML` templating, `createElement`, class/attribute toggles, dynamic options, and Chart.js canvas mounting. |
| **Event Listeners** | `js/app.js`: bootstrap listener, hash router, delegated `[data-action]` click handler, form submissions, input/change listeners, keyboard shortcuts, and resize handlers. |
| **localStorage** | `js/storage.js`: `saveAll`, `loadAll`, `AuthService`, JSON export/import with schema validation, CSV export, and `resetAll`. |
| **Modern Syntax** | Strict ES2020+ standards: `const`/`let` only, destructuring, spread/rest, template literals, optional chaining, default parameters — **zero `var` anywhere**. |

### Factory Pattern — `js/transactionFactory.js`
`TransactionFactory.createTransaction(data)` is the **single place** where every entry object is born. It guarantees every record has the exact same schema:
```javascript
{ id, title, amount, type, category, date, paymentMethod, note, recurring, createdAt }
```
*Why it matters:* One schema contract, one place to change. When duplicating an entry via `duplicateTransaction()`, the factory generates a **fresh unique ID and timestamp**, preventing ID collisions.

### Singleton Pattern — `js/expenseTracker.js`
```javascript
const tracker = ExpenseTracker.getInstance(); // The only instance, ever
```
An IIFE closure keeps `instance` and data collections private. The first call instantiates the manager; every subsequent call returns that exact same manager. The Singleton owns all data collections, executes financial totals, and automatically calls `StorageService.saveAll()` after each mutation.

*Why it matters:* Guarantees **one single source of truth** across UI, analytics, and storage.

### Strategy Pattern — `js/strategies.js`
Six sorting algorithms live side by side as interchangeable pure functions:
```javascript
SortStrategies = { newest, oldest, highest, lowest, az, za }

applySortStrategy("highest", transactions) // Context executes strategy at runtime
```
The context function (`applySortStrategy`) executes the selected strategy and returns a **new sorted array** without mutating the original data.
*Why it matters:* Adding a new sorting option requires adding one function to `SortStrategies` without modifying UI or rendering code (Open/Closed Principle).

---

## 5. Oral Presentation Guide (3 Members)

**Suggested presentation time: ~8–10 minutes total (~3 minutes per member).**

### Member 1 — Product Demo & User Experience (~3 min)
1. Open `index.html` → show the Landing page with direct username/password authentication.
2. Sign in to view the **Dashboard** → show KPI cards, cash flow bar, category donut, and recent activity.
3. Open the **Module Guide** modal via the `[ ? Guide ]` toolbar button to demonstrate the step-by-step tutorial.
4. Navigate to **Entries** → add an entry (₱450 Groceries via GCash); show instant balance recalculation and toast alert.
5. Highlight **Budgets** (warning meters), **Recurring** (due alerts & batch generation), and the **FAQ & Help Center**.

### Member 2 — Architecture & Design Patterns (~3 min)
1. Walk through the modular architecture (`modules/*` partials merged by `scripts/build.js` into standalone `index.html`).
2. **Factory:** Open `js/transactionFactory.js`, explain `createTransaction()` schema enforcement and `duplicateTransaction()`.
3. **Singleton:** Open `js/expenseTracker.js`, explain the IIFE closure, `getInstance()`, and the single source of truth.
4. **Strategy:** Open `js/strategies.js`, show the six interchangeable sorting algorithms and immutable array returns.

### Member 3 — JS Fundamentals, LocalStorage & Security (~3 min)
1. **Core JS:** Show array methods (`.filter()`, `.map()`, `.reduce()`) in `analytics.js` and strict ES6+ syntax.
2. **Event Delegation:** Show the unified `[data-action]` event dispatcher in `js/app.js`.
3. **LocalStorage & AuthService:** Open DevTools → Application → Local Storage to show the 8 `ef_*` keys; refresh to prove persistence.
4. **Data Sovereignty:** Demonstrate **Export CSV** (for Excel/Sheets), **Export JSON** (for backups), and validated JSON import.

---

## 6. Tech Stack

* **Structure:** HTML5 (Modular components compiled via `scripts/build.js`).
* **Styling:** Vanilla CSS3 (Neo-Brutalism design system, custom CSS variables, responsive Flexbox/Grid, zero CSS frameworks).
* **Scripting:** Vanilla JavaScript (ES2020+, Modular IIFEs, Design Patterns).
* **Icons:** Lucide Icons (v0.441.0) with embedded SVG sprite definitions.
* **Charts:** Chart.js 4 via CDN.
* **Storage:** Native browser `localStorage` (offline-first, client persistence).
* **Tooling:** Lightweight Node.js scripts for modular compilation and live-reloading.

---

*ExpenseFlow — JavaScript Weeks 1–5 Group Activity.*
