
# 01. Project Overview — ExpenseFlow

## What is ExpenseFlow?

**ExpenseFlow** is a modern personal expense tracker

It provides an intuitive dashboard where users can log income, record expenses, set monthly spending limits, and visualize their financial habits using interactive charts.

---

## The Core Concept: A Universal Tracker for Everyone

ExpenseFlow was built so that **any type of user** can easily manage their finances without unnecessary complexity:

* 🎒 **For Students:**
  Track weekly or monthly allowances (`Allowance` category), daily commute fares (`Transportation`), school supplies, printing costs, and cafeteria meals (`Food`).
* 💼 **For Employees:**
  Monitor salary payouts (`Salary` category), recurring household bills (`Bills`), subscriptions (`Netflix`, `Internet`), and personal savings.
* 🏢 **For Online Sellers & Freelancers:**
  Record gig and project payouts (`Freelance` & `Business` categories), track inventory/packaging costs, and monitor cash flow across payment channels like GCash, Maya, and Bank Transfer.

---

## Key Features

| Feature                      | Description                                                                                                        |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| **Dashboard**          | Bento-grid view showing available balance, income vs. expense breakdown, monthly budget ring, and category charts. |
| **Transactions**       | Complete searchable history with sorting strategies (Newest, Oldest, Highest, Lowest, A–Z, Z–A) and filters.     |
| **Budgets**            | Set spending limits per month or specifically for categories like Food, Bills, and Transportation.                 |
| **Categories**         | 17 preloaded default categories (11 expenses + 6 income) with the ability to add custom categories and icons.      |
| **Recurring Expenses** | Schedule repeating expenses (weekly, monthly, yearly) with an overdue alert banner and a "Generate Due" button.    |
| **Reports**            | 6-month comparison bar charts, daily spending trend lines, and automated financial insights.                       |
| **Data Management**    | 1-click Demo Data loading, full CSV export, validated JSON export/import, and clean reset.                         |

---

## Technology Stack

* **Structure:** Semantic HTML5.
* **Styling:** Vanilla CSS3 (Glassmorphism, Bento Grid layout, custom CSS variables, responsive design).
* **Logic:** Vanilla JavaScript (ES6+) with zero build tools and zero framework dependencies.
* **Data Storage:** Browser **`localStorage`** (persistent, offline-first client storage).
* **Visualization:** Chart.js 4 (loaded via CDN with an offline-friendly fallback).
