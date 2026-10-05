# 01. Project Overview — ExpenseFlow

## What is ExpenseFlow?

**ExpenseFlow** is a modern, privacy-focused personal expense tracker built with pure **HTML5, Vanilla CSS3 (Neo-Brutalism design system), and Vanilla JavaScript (ES6+)**.

It provides an intuitive, high-contrast dashboard where users can manage income, record expenses, enforce category budgets, automate recurring subscriptions, and visualize financial habits with interactive charts. All data is stored locally in the browser via `localStorage`—zero third-party tracking, zero external database servers, and zero cloud telemetry.

---

## The Core Concept: A Universal Tracker for Everyone

ExpenseFlow was designed from the ground up so that **any type of user** can easily manage their finances without unnecessary complexity:

* 🎒 **For Students:**
  Track daily or weekly allowances (`Allowance` category), daily commute fares (`Transportation`), school supplies, printing costs, and cafeteria meals (`Food`).
* 💼 **For Employees:**
  Monitor salary payouts (`Salary` category), recurring household bills (`Bills`), subscriptions (`Netflix`, `Internet`), and personal savings targets.
* 🏢 **For Online Sellers & Freelancers:**
  Record gig and project payouts (`Freelance` & `Business` categories), track inventory/packaging costs, and monitor cash flow across payment channels like Cash, GCash, Maya, Debit/Credit Card, and Bank Transfer.

---

## Key Features & Modules

| Module / Feature | Description |
| ---------------- | ----------- |
| **Landing & Authentication** | Welcoming introduction, direct username/password sign-in and registration tabs, show/hide password visibility toggle, and strict validation checks (warns only if username is empty or already taken). |
| **Dashboard** | Real-time KPI summary cards (Total Balance, Income, Expenses), monthly period switcher, interactive cash flow and category donut charts, and recent entries feed. |
| **Entries (Ledger)** | Complete financial history table with real-time keyword search, advanced multi-criteria filters (type, category, payment method, date range, min/max amount), 6 sorting strategies, and row action menus (View, Edit, Duplicate, Delete). |
| **Categories** | Full CRUD category management (Expense and Income) with custom name, monthly budget cap, and a 24-icon Neo-Brutalism SVG picker. Protected defaults safeguard data integrity. |
| **Budgets** | Overall monthly spending ceiling and granular category-specific budget progress bars with automatic color-coded threshold alerts (Safe `<70%`, Caution `70–99%`, Over-budget `100%+`). |
| **Recurring Expenses** | Schedule repeating bills, subscriptions, or allowances (Daily, Weekly, Bi-weekly, Monthly, Yearly) with due-date alert banners and one-click "Generate Due" batch posting. |
| **Reports & Analytics** | Period-scoped financial analytics, cash flow trends, category spending distribution donut chart, and instant data export (CSV for spreadsheets and JSON for backups). |
| **FAQ & Documentation** | Comprehensive in-app Help Center with live keyword search, topic filter pills, and 10+ expandable step-by-step guide accordions. |
| **Profile & Settings** | Account credentials management, display name, avatar initials, active session telemetry, theme switcher (Light/Dark), currency selector (₱, $, €, £, ¥), demo sample data loader, and clean database reset. |
| **Step-by-Step Module Tutorials** | Interactive popup tutorial modal available on every module. Automatically introduces fields and buttons to first-time users with Step X of Y progress, purpose explanations, and on-demand replay via toolbar buttons. |

---

## Technology Stack

* **Structure:** Semantic HTML5 segmented into modular partials (`modules/*`) assembled via `scripts/build.js` into a standalone, portable `index.html`.
* **Styling:** Vanilla CSS3 featuring a bold **Neo-Brutalism (Neubrutalism)** design system—high-contrast solid borders (2–3px), crisp zero-blur offset drop shadows (3–8px), vibrant flat color accents, tactile mechanical press interactions, and responsive CSS Grid/Flexbox layouts.
* **Logic:** Vanilla JavaScript (ES2020+) utilizing modular IIFEs, clean Separation of Concerns, and strict ES6+ syntax (`const`/`let`, arrow functions, destructuring, template literals—zero `var`).
* **Design Patterns:** Object-Oriented and Behavioral Design Patterns: **Factory** (`TransactionFactory`), **Singleton** (`ExpenseTracker`), and **Strategy** (`SortStrategies`).
* **Data Persistence:** Browser **`localStorage`** (offline-first, zero-friction client storage with automatic serialization).
* **Icons:** Lucide Icons (v0.441.0) with an embedded SVG symbol sprite catalog for crisp, scalable vector graphics.
* **Visualization:** Chart.js 4 (loaded via CDN with responsive rendering).
* **Build Tooling:** Lightweight, optional Node.js build & watch scripts (`scripts/build.js`, `scripts/watch.js`) for modular developer ergonomics.
