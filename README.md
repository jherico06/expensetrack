# ExpenseFlow — Smart Personal Expense Tracker

A complete, dependency-light personal finance dashboard built with **HTML, CSS and vanilla
JavaScript** (Weeks 1–5 group activity). Glassmorphism + bento-grid dark fintech design,
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
| **Settings** | Dark / light theme, currency & preferences, import JSON (validated), load sample data, reset all data, data-storage overview |
| **About** | Project info, tech stack, feature checklist, group members |

Cross-cutting features:

- **Design patterns** — Factory, Singleton and Strategy (see §4)
- **Persistence** — everything saved to `localStorage` after each change (5 keys)
- **Theme switcher** — dark ⇄ light, remembered between visits
- **Month navigation** — browse any month; stats, charts and budgets are month-scoped
- **Empty states & toasts** — guided first-run experience, non-blocking feedback
- **Accessibility** — semantic markup, ARIA labels, focus-visible rings, keyboard support (`Esc` closes modals, `Ctrl/Cmd + K` focuses search)
- **Responsive** — desktop → laptop → tablet → mobile (stacked cards, drawer sidebar, FAB quick-add)
- Starts **empty on purpose**: use *Settings → Load Sample Data* to populate a realistic demo

---

## 2. Getting started

```text
1. Double-click index.html            (works from file://)
2. Optional: Settings → Load Sample Data
3. Add a transaction with the "Add Transaction" button
```

Optional local server (any is fine):

```bash
npx serve .
# or
python -m http.server 8080
```

**Note:** Chart.js is loaded from the jsDelivr CDN. Without internet the app still works
fully — charts simply show a friendly "charts unavailable offline" message.

---

## 3. Project structure

```text
Expense Tracker/
├── index.html                 app shell · SVG icon sprite · modals/forms · script tags
├── css/
│   ├── style.css              design tokens · glassmorphism · bento grid · components
│   ├── responsive.css          breakpoints: 1360 / 1200 / 992 / 768 / 480 / 1800+
│   └── animations.css          entrances, micro-interactions, reduced-motion support
├── js/
│   ├── utils.js               formatting, dates, debounce, ids, validation helpers
│   ├── transactionFactory.js   FACTORY design pattern
│   ├── strategies.js           STRATEGY design pattern
│   ├── expenseTracker.js       SINGLETON design pattern + business logic
│   ├── storage.js              LOCAL STORAGE layer (load/save/export/import/reset)
│   ├── analytics.js            stats, insights, notifications, Chart.js wrappers
│   ├── ui.js                   DOM MANIPULATION — renderers, modals, toasts, filters
│   └── app.js                  EVENT LISTENERS — bootstrap, hash router, delegation
├── data/
│   └── sampleData.js           generator for the demo dataset
└── assets/
    ├── icons/                  (reserved — icons ship as an inline SVG sprite)
    └── images/                 (reserved)
```

Scripts load as classic `<script>` tags in dependency order (works from `file://`).

**Storage keys:** `ef_transactions` · `ef_budgets` · `ef_categories` · `ef_recurring` · `ef_settings`

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
