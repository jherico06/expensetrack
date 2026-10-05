# ExpenseFlow — Smart Personal Expense Tracker

A complete, dependency-light personal finance dashboard built with **HTML, CSS and vanilla
JavaScript** (Weeks 1–5 group activity). Neo-Brutalism (Neubrutalism) bento-grid design,
fully responsive, persistent through `localStorage`, with interactive charts via Chart.js.

> Open `index.html` in any modern browser — no build step, no server required.

---

## 1. Features

| Page | What it does |
|---|---|
| **Dashboard** | Available balance, income vs. expenses, monthly budget ring (Safe → Moderate → Warning → Exceeded), spending analytics donut, financial insights, top spending list, recent transactions |
| **Transactions** | Full history table, live search, advanced filters (type, category, payment method, date range, min/max amount), 6 sort options, row actions (edit / duplicate / delete with confirmation) |
| **Budgets** | Overall monthly budget (limit, spent, remaining, % used) + per-category budget cards with progress bars and colour-coded states |
| **Categories** | 17 default categories (11 expense + 6 income), add custom categories with emoji icons, rename/archive, defaults are protected from deletion |
| **Recurring** | Weekly / monthly / yearly templates, due-soon & overdue banners, one-click "generate due transactions" |
| **Reports** | 6-month income vs. expenses bar chart, daily spending trend, category donut + distribution bars, generated insights, CSV / JSON export |
| **Settings** | Dark / light theme, currency & preferences, import JSON (validated), export CSV/JSON, reset all data, data-storage overview |
| **About** | Project info, tech stack, feature checklist, group members |

Cross-cutting features:

- **Design patterns** — Factory, Singleton and Strategy (see §4)
- **Persistence** — everything saved to `localStorage` after each change (5 keys)
- **Theme switcher** — dark ⇄ light, remembered between visits
- **Month navigation** — browse any month; stats, charts and budgets are month-scoped
- **Empty states & toasts** — guided first-run experience, non-blocking feedback
- **Accessibility** — semantic markup, ARIA labels, focus-visible rings, keyboard support (`Esc` closes modals, `Ctrl/Cmd + K` focuses search)
- **Responsive** — desktop → laptop → tablet → mobile (stacked cards, drawer sidebar, FAB quick-add)
- Starts **clean and raw**: ready for immediate input with "+ Add Transaction" or JSON import

---

## 2. Getting started

Simply double-click **`index.html`** in any modern web browser (Chrome, Edge, Firefox, Safari).
* Works immediately from `file://` — **no server, no bundler, no installation required**.
* Start immediately by clicking **+ Add Transaction** or importing your data.

---

## 3. Project structure

```text
expensetrack/
├── index.html                   Assembled App Shell (runs 100% offline via file:// or http://)
├── index.template.html          Master HTML template with modular injection slots
├── package.json                 NPM scripts: `npm run build` and `npm run watch`
├── README.md                    Project guide & documentation index
├── modules/                     Segmented modular HTML components
│   ├── landing/landing.html     Landing hero, stickers, auth card (login + registration)
│   ├── sidebar/sidebar.html     Sidebar navigation, hamburger toggle, profile footer
│   ├── topbar/topbar.html       Application header, month chip, theme toggle, logout
│   ├── dashboard/dashboard.html Bento overview, balance, budget, recent transactions
│   ├── transactions/transactions.html Table view, live search, advanced filters, pagination
│   ├── budgets/budgets.html     Overall monthly meter & category budget cards
│   ├── categories/categories.html Category manager, badges, icon picker
│   ├── recurring/recurring.html Subscriptions, bills, schedule generator
│   ├── reports/reports.html     Financial charts, cashflow bar, category donut
│   ├── settings/settings.html   Preferences, currency, data backup & reset
│   ├── about/about.html         Application guide & user instructions
│   ├── profile/profile.html     Account credentials form & session telemetry
│   └── modals/modals.html       Transaction, budget, category & recurring modals
├── scripts/
│   ├── build.js                 Assembles modules/* into index.html
│   ├── watch.js                 Watches modules/ for changes and auto-rebuilds
│   └── extract.js               Utility for segmenting modules from template
├── css/
│   ├── style.css                Neo-brutalism design tokens, surfaces & components
│   ├── responsive.css           Breakpoints (desktop, tablet, mobile drawer)
│   └── animations.css           Entrances & tactile micro-interactions
├── js/
│   ├── utils.js                 Formatting, currency, dates, helpers
│   ├── transactionFactory.js    [FACTORY PATTERN] Object creation
│   ├── strategies.js            [STRATEGY PATTERN] Sorting & filtering algorithms
│   ├── expenseTracker.js        [SINGLETON PATTERN] State manager & store
│   ├── storage.js               Persistent storage layer & AuthService
│   ├── analytics.js             Chart.js wrappers & calculations
│   ├── ui.js                    DOM manipulation, modals, toasts
│   └── app.js                   Router, delegated event listeners & validation
├── data/
│   └── sampleData.js            Sample data generator
└── documentation/               Presentation guides & documentation assets
```

---

## 4. JavaScript concepts & design patterns

### Concepts checklist

| Concept | Where it is used |
|---|---|
| **Variables & application state** | `js/ui.js` state block (`currentPage`, `currentMonth`, `filters`, `currentSort`) and the private state inside the Singleton (`transactions`, `budgets`, `categories`, `recurring`, `settings`) — `js/expenseTracker.js:42` |
| **Objects** | `Utils`, `TransactionFactory`, `SortStrategies`, `StorageService`, `Analytics`, `SampleData`, settings/preferences records, category & budget records |
| **Arrays** | Every collection is an array manipulated with `map`, `filter`, `reduce`, `find`, `findIndex`, `sort`, `slice` (totals, breakdowns, insights, rendering) |
| **Functions** | Arrow functions, named functions, higher-order functions (`applySortStrategy`, debounced search, render callbacks), an IIFE that builds the Singleton, promise-based confirm dialog |
| **DOM manipulation** | All rendering lives in `js/ui.js` — `innerHTML` templates, `createElement`, class/attribute toggling, `hidden` state, dynamic option lists, chart canvas mounting |
| **Event listeners** | `js/app.js` — bootstrap listener, hash router, one delegated `[data-action]` click handler, form submits, input/change events, keyboard shortcuts, resize handler |
| **localStorage** | `js/storage.js` — `saveAll`, `loadAll`, `bootstrap`, JSON export/import with validation, CSV export, `resetAll` |
| **Modern syntax** | `const`/`let` only, destructuring, spread/rest, template literals, optional chaining, default parameters — **no `var` anywhere** |

### Factory — `js/transactionFactory.js`

`TransactionFactory.createTransaction(data)` is the **single place** where a transaction is
born (form submission, duplicate action, generated recurring items). It guarantees every
record has the same complete shape:

```js
{ id, title, amount, type, category, date, paymentMethod, note, recurring, createdAt }
```

*Why it matters:* one contract, one place to change — no half-built objects ever reach the
state. `duplicateTransaction()` shows reuse: a copy is just another factory call, so it
always gets a **fresh id and timestamp**.

### Singleton — `js/expenseTracker.js`

```js
const tracker = ExpenseTracker.getInstance();   // the only instance, ever
```

An IIFE keeps `instance` private; the first call creates the manager, every later call
returns the same one. The Singleton owns all data collections and exposes every CRUD +
calculation method, then persists through `StorageService.saveAll()` after each change.

*Why it matters:* the whole app shares **one source of truth** — UI, analytics and storage
can never disagree or accidentally create competing copies of the data.

### Strategy — `js/strategies.js`

Six sorting rules live side by side as interchangeable functions:

```js
SortStrategies = { newest, oldest, highest, lowest, az, za }

applySortStrategy("highest", transactions)   // context picks the strategy at runtime
```

The context (`applySortStrategy`) validates the name and returns a **new sorted array**
(the input is never mutated). The UI simply changes `state.currentSort` — see
`js/ui.js:696` and the sorting listener in `js/app.js`.

*Why it matters:* adding a 7th sort option = adding one object entry. No `if/else` chains,
no changes to rendering code — the open/closed principle in action.

---

## 5. Presentation guide (3 members)

**Suggested flow: ~8–10 minutes total.**

### Member 1 — Live product demo (≈3 min)
1. Open `index.html` → explain the brief (glassmorphism bento dashboard, vanilla JS).
2. *Settings → Load Sample Data* → show the dashboard fill up (balance, budget ring, donut, insights).
3. Add a transaction → show toast, updated totals, and the new row in **Transactions**.
4. Show **Budgets** (warning/exceeded states) and the **month navigator** (compare vs. previous month).

### Member 2 — Architecture & design patterns (≈3 min)
1. Walk the file structure (`index.html` → `css/` → `js/`) and the script load order.
2. **Factory**: open `transactionFactory.js`, point at `createTransaction()`; explain the fixed object shape; demo *Duplicate* on a transaction row.
3. **Singleton**: open `expenseTracker.js`, show `getInstance()` + the private state; explain "one source of truth" + auto-persist.
4. **Strategy**: open `strategies.js`; change the sort dropdown in the app and show that only `state.currentSort` changes.
5. Mention the comment markers used across the codebase (`FACTORY / SINGLETON / STRATEGY DESIGN PATTERN`, `LOCAL STORAGE`, `DOM MANIPULATION`, `EVENT LISTENERS`, `VARIABLES AND APPLICATION STATE`).

### Member 3 — JS fundamentals + data & QA (≈3 min)
1. **Variables/arrays/functions**: show the state block in `ui.js` and a `reduce` calculation in `analytics.js`.
2. **DOM + events**: show the delegated `[data-action]` handler in `app.js` and a renderer in `ui.js`.
3. **localStorage**: open DevTools → Application → Local Storage → inspect `ef_*` keys; reload the page to prove persistence.
4. Finish with **Reports** (charts + insights), **Export CSV/JSON**, and *Settings → Reset All Data* to show the validated import/reset flows.

### User flow to demo end-to-end
```text
Load sample data → Dashboard overview → Add transaction → Search/filter/sort
→ Set/edit a budget → Check budget states → Recurring due banner →
Reports & insights → Export CSV → Toggle theme → Reload (data persists)
```

---

## 6. Tech stack

- **HTML5** · **CSS3** (custom properties, grid/flex, `backdrop-filter` glassmorphism)
- **Vanilla JavaScript (ES2020+)** — no framework, no bundler
- **Chart.js 4** via CDN (bar, line, doughnut)
- **localStorage** for persistence
- Tested in Chrome/Edge (Chromium) — desktop 1440px, laptop, tablet and 390px mobile

---

*ExpenseFlow — JS Weeks 1–5 group activity.*
