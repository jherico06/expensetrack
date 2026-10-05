/**
 * moduleGuide.js
 * ExpenseFlow – Step-by-Step Module Tutorial Modal
 * 
 * Provides an in-depth, step-by-step popup tutorial modal for every module
 * (Dashboard, Entries, Categories, Budgets, Reports, Recurring, FAQ, Profile).
 * Explains the exact purpose, fields, buttons, and usage instructions of each
 * component for first-time users, with next/back navigation and on-demand replay.
 */

const ModuleGuide = (() => {
  const STORAGE_PREFIX = "ef_seen_guide_";

  /* ==========================================================
     MODULE TUTORIAL STEP DATA DICTIONARY
     ========================================================== */
  const MODULE_GUIDES = {
    dashboard: {
      name: "Dashboard Overview",
      icon: "icon-grid",
      badgeClass: "badge-yellow",
      description: "Welcome to your financial command center! Here is what every part of the Dashboard does:",
      steps: [
        {
          badge: "SUMMARY CARDS",
          pillClass: "pill-cyan",
          title: "Total Balance, Income & Expense Cards",
          icon: "icon-wallet",
          purpose: "Provides an instant real-time snapshot of your net financial status for the selected calendar month.",
          how: "The cards automatically calculate:\n• Total Balance: Net cash left (Total Income minus Total Expenses)\n• Total Income: All incoming funds, salaries, allowances, and deposits\n• Total Expenses: All cash outflow and purchases recorded\n• Percentage badges indicate whether you are up or down compared to last month.",
          tip: "A positive balance highlighted in green means your cash flow is healthy and you are spending less than you earn."
        },
        {
          badge: "TIME TOOLBAR",
          pillClass: "pill-purple",
          title: "Month Navigation & Period Selector",
          icon: "icon-calendar",
          purpose: "Allows you to navigate between past, present, and future calendar months to review history or plan ahead.",
          how: "• Click the '‹' and '›' arrow buttons to shift backward or forward one month.\n• Click 'Go to current month' anytime to jump back to today.\n• The active month label displays the period currently being viewed.",
          tip: "All metrics, charts, budget bars, and entries on the page dynamically re-calculate for the selected month."
        },
        {
          badge: "VISUAL CHARTS",
          pillClass: "pill-lime",
          title: "Income vs Expense & Category Charts",
          icon: "icon-chart",
          purpose: "Visualizes cash flow dynamics and spending proportions without having to read through raw numbers.",
          how: "• Cash Flow Bar Chart: Compares daily or monthly money in vs money out.\n• Category Doughnut Chart: Breaks down your biggest spending sectors (Food, Utilities, Transportation, etc.).\n• Hover or tap any slice or bar to see exact amounts and percentages.",
          tip: "Clicking a category in the chart legend toggles that category on or off for comparison."
        },
        {
          badge: "RECENT ACTIVITY",
          pillClass: "pill-pink",
          title: "Recent Entries Ledger & Quick Actions",
          icon: "icon-list",
          purpose: "Gives you instant access to recently recorded financial activities without navigating away.",
          how: "• Lists your latest transactions with their category icon, title, payment method, date, and signed amount.\n• Click the three dots (⋮) on any entry to View details, Edit, or Duplicate it.\n• Click 'View all entries' to navigate directly to the full Entries ledger.",
          tip: "Press 'N' on your keyboard anywhere in the app to immediately open the Add Entry modal!"
        }
      ]
    },

    transactions: {
      name: "Entries Ledger",
      icon: "icon-list",
      badgeClass: "badge-cyan",
      description: "The Entries module is your central financial log. Here is how each tool and field works:",
      steps: [
        {
          badge: "PRIMARY ACTION",
          pillClass: "pill-yellow",
          title: "+ Add Entry Button",
          icon: "icon-plus",
          purpose: "The primary button used to record any new expenditure or income transaction.",
          how: "Click '+ Add Entry' to open the entry form with these fields:\n• Entry Title: What the payment was for (e.g. 'Coffee with friends', 'Freelance Project').\n• Amount (₱): Numeric monetary value.\n• Entry Type: Expense (cash out) or Income (cash in).\n• Category: Choose from your custom or default categories.\n• Date: The date the transaction took place (defaults to today).\n• Payment Method: Cash, GCash, Maya, Debit Card, Credit Card, or Bank Transfer.\n• Recurring: Check this if this bill repeats on a regular schedule.",
          tip: "You can also press 'N' on your keyboard anytime to open this form directly."
        },
        {
          badge: "DISCOVERY",
          pillClass: "pill-purple",
          title: "Search Bar & Quick Filter",
          icon: "icon-search",
          purpose: "Instantly finds any specific transaction as you type, with zero lag.",
          how: "• Type words to match titles (e.g., 'Groceries'), categories ('Food'), payment methods ('GCash'), or notes.\n• Results update dynamically with highlighted matches in real time.",
          tip: "Searching 'GCash' or 'Cash' will isolate all payments made via that specific channel."
        },
        {
          badge: "FILTER PANEL",
          pillClass: "pill-lime",
          title: "Advanced Filters & Thresholds",
          icon: "icon-filter",
          purpose: "Enables multi-condition filtering to audit specific spending habits or date periods.",
          how: "Click 'Filters' to expand options:\n• Type: Filter by All, Income only, or Expense only.\n• Category: Isolate a single spending category.\n• Payment Method: Filter by cash, e-wallets, or cards.\n• Date Range: This Month, Last 30 Days, This Year, or Custom date bounds.\n• Min / Max Amount: Find large purchases or micro-expenses.",
          tip: "The yellow count badge on the Filters button shows how many filters are currently active."
        },
        {
          badge: "ORGANIZATION",
          pillClass: "pill-pink",
          title: "Sort Order Dropdown",
          icon: "icon-repeat",
          purpose: "Reorders your transaction records to suit how you want to analyze your data.",
          how: "Select from the dropdown:\n• Newest first (default chronological order)\n• Oldest first\n• Highest amount (see your biggest spending items immediately)\n• Lowest amount\n• Alphabetical A–Z or Z–A",
          tip: "Sorting by 'Highest amount' is a quick way to discover your most expensive purchases this month."
        },
        {
          badge: "ROW ACTIONS",
          pillClass: "pill-cyan",
          title: "Action Menu (⋮) on Every Entry",
          icon: "icon-dots",
          purpose: "Gives you complete management capabilities for every individual recorded entry.",
          how: "Click the '⋮' button on any row:\n• View Details: Opens a clean modal with full breakdown and timestamps.\n• Edit Entry: Modify amount, category, date, or title.\n• Duplicate: Immediately copies the entry so you don't have to re-type repeating purchases.\n• Delete: Safely removes the transaction (requires confirmation).",
          tip: "Duplicate is great for repeating identical purchases like daily commutes or recurring lunches."
        }
      ]
    },

    categories: {
      name: "Categories Module",
      icon: "icon-tag",
      badgeClass: "badge-purple",
      description: "Categories classify and organize your cash flow. Here is what every component does:",
      steps: [
        {
          badge: "PRIMARY ACTION",
          pillClass: "pill-yellow",
          title: "+ Add Category Button",
          icon: "icon-plus",
          purpose: "Create custom categories tailored to your personal life and spending habits.",
          how: "Click '+ Add Category' to open the creator modal:\n• Category Name: e.g. 'Gym & Fitness', 'Streaming Services', 'Side Business'.\n• Category Type: Expense (outgoing spending) or Income (incoming revenue).\n• Icon Selector: Choose from 24 bold Neo-Brutalism icons.\n• Monthly Budget (Optional): Set a target spending limit for this category.",
          tip: "Custom icons appear automatically throughout the app, dashboard, charts, and entries list."
        },
        {
          badge: "EXPENSE LIST",
          pillClass: "pill-pink",
          title: "Expense Categories Column",
          icon: "icon-arrow-down",
          purpose: "Manages all categories where money is spent.",
          how: "• Displays each category card with its icon, name, monthly budget target, and total logged entries.\n• Click 'Edit' on any card to update its name, icon, or budget allocation.\n• Click 'Delete' to remove a category you no longer use.",
          tip: "If a category already has entries logged, you will be prompted to reassign them before deletion."
        },
        {
          badge: "INCOME LIST",
          pillClass: "pill-lime",
          title: "Income Categories Column",
          icon: "icon-arrow-up",
          purpose: "Manages all categories representing your revenue streams.",
          how: "• Lists income channels such as Salary, Freelance, Allowance, Investments, or Gifts.\n• Track how many income entries belong to each source.",
          tip: "Separating salary from side-hustle revenue helps you track income diversification."
        }
      ]
    },

    budgets: {
      name: "Budgets Module",
      icon: "icon-wallet",
      badgeClass: "badge-lime",
      description: "Budgets protect your savings by enforcing spending limits. Here is how each tool works:",
      steps: [
        {
          badge: "MONTHLY CEILING",
          pillClass: "pill-yellow",
          title: "Monthly Total Budget Card",
          icon: "icon-shield",
          purpose: "Defines your overall financial ceiling for all combined expenses in the active month.",
          how: "• Shows Total Budget, Total Spent so far, and Remaining allowance.\n• The progress bar fills in real-time as you log expenses throughout the month.\n• Click 'Edit Monthly Budget' anytime to increase or tighten your monthly target.",
          tip: "Aim to keep total spending below 80% of your budget to build an emergency fund."
        },
        {
          badge: "CATEGORY ALLOCATION",
          pillClass: "pill-purple",
          title: "+ Category Budget Button",
          icon: "icon-plus",
          purpose: "Assigns granular spending limits to specific high-risk or essential categories.",
          how: "• Click '+ Category Budget' and select a category (e.g., 'Dining Out' or 'Shopping').\n• Enter a monthly limit (e.g., ₱3,000.00).\n• A dedicated budget meter is created to monitor that category independently.",
          tip: "Setting limits on discretionary spending categories is the fastest way to curb impulse purchases."
        },
        {
          badge: "WARNING SYSTEM",
          pillClass: "pill-pink",
          title: "Budget Meters & Overspending Alerts",
          icon: "icon-alert",
          purpose: "Provides immediate visual alerts before you exceed your financial allowances.",
          how: "• Green Bar (< 70%): Spending is on track and healthy.\n• Amber Bar (70% – 99%): Approaching budget limit, caution advised.\n• Red Warning Bar (100%+): Over-budget! The badge highlights overspending in bright alert colors.",
          tip: "Check your budget meters mid-month to adjust spending before you reach the red zone."
        }
      ]
    },

    reports: {
      name: "Reports & Analytics",
      icon: "icon-chart",
      badgeClass: "badge-cyan",
      description: "Reports transform your numbers into visual insights. Here is what each section provides:",
      steps: [
        {
          badge: "TIME FILTER",
          pillClass: "pill-purple",
          title: "Month Navigation & Period Filter",
          icon: "icon-calendar",
          purpose: "Enables you to focus your financial analytics on any specific month.",
          how: "• Use the '‹' and '›' arrows to switch months.\n• All graphs, metric cards, and category breakdowns instantly recalculate for that period.",
          tip: "Compare reports between consecutive months to observe seasonal spending patterns."
        },
        {
          badge: "BREAKDOWN",
          pillClass: "pill-yellow",
          title: "Spending Breakdown Donut Chart",
          icon: "icon-pie",
          purpose: "Visualizes the percentage share of every spending category relative to your total expenditure.",
          how: "• Each colored slice represents a category's slice of wallet.\n• Hover over slices to see exact peso figures and percentages.\n• Identifies your biggest money drains at a glance.",
          tip: "If a single category occupies more than 40% of your expenses, investigate ways to optimize it."
        },
        {
          badge: "DATA EXPORT",
          pillClass: "pill-lime",
          title: "Export CSV & Export JSON Buttons",
          icon: "icon-download",
          purpose: "Allows you to export your data for backups, tax preparation, or spreadsheet analysis.",
          how: "• Export CSV: Generates a standard spreadsheet file compatible with Excel, Google Sheets, and Numbers.\n• Export JSON: Exports a complete structured backup file of your entire database.",
          tip: "Because your data is stored locally on your device, exporting regular JSON backups keeps your records safe."
        }
      ]
    },

    recurring: {
      name: "Recurring Expenses",
      icon: "icon-repeat",
      badgeClass: "badge-yellow",
      description: "Automate repeating financial commitments. Here is how each tool functions:",
      steps: [
        {
          badge: "SETUP",
          pillClass: "pill-purple",
          title: "+ Add Recurring Button",
          icon: "icon-plus",
          purpose: "Creates scheduled recurring payments like rent, Netflix, Spotify, gym, or tuition.",
          how: "Click '+ Add Recurring' and specify:\n• Title: Description of the recurring bill or income.\n• Amount (₱): Expected payment amount.\n• Frequency: Daily, Weekly, Bi-weekly, Monthly, or Yearly.\n• Next Due Date: When the next payment occurs.\n• Category & Payment Method: Default tags for the generated entry.",
          tip: "Scheduling recurring bills ensures your financial projections account for fixed overhead."
        },
        {
          badge: "ALERTS",
          pillClass: "pill-pink",
          title: "Due Date Notification Banner",
          icon: "icon-bell",
          purpose: "Alerts you as soon as one or more scheduled bills have arrived at their due date.",
          how: "• The banner automatically appears at the top of the page when payments are due.\n• Shows how many bills require generation.",
          tip: "You also get an in-app toast reminder when launching the app if recurring payments are due."
        },
        {
          badge: "AUTOMATION",
          pillClass: "pill-lime",
          title: "Generate Due Button",
          icon: "icon-refresh",
          purpose: "One-click posting that turns all pending due recurring schedules into logged entries.",
          how: "• Click 'Generate Due' to automatically create records in your Entries ledger for each due bill.\n• Advances each recurring schedule's Next Due Date to the subsequent cycle automatically.",
          tip: "No need to manually enter monthly bills! Just click 'Generate Due' once a month."
        }
      ]
    },

    faq: {
      name: "FAQ & Documentation",
      icon: "icon-help",
      badgeClass: "badge-purple",
      description: "Your comprehensive knowledge base and how-to guide. Here is what every part does:",
      steps: [
        {
          badge: "SEARCH & FILTER",
          pillClass: "pill-yellow",
          title: "Search Bar & Topic Filter Pills",
          icon: "icon-search",
          purpose: "Quickly locates specific tutorials, answers, and definitions.",
          how: "• Type any keyword (e.g., 'budget', 'export', 'category', 'pin') to filter FAQs in real-time.\n• Click topic pills ('All Topics', 'Step-by-Step Tutorials', 'Features & Security', 'Shortcuts') to isolate categories.",
          tip: "Click 'Clear' in the search bar to restore the complete guide view."
        },
        {
          badge: "GUIDES",
          pillClass: "pill-cyan",
          title: "Step-by-Step Interactive Accordions",
          icon: "icon-list",
          purpose: "Delivers in-depth, structured instructions for every feature in the application.",
          how: "• Click any accordion title to expand detailed step-by-step instructions.\n• Includes field definitions, keyboard shortcuts, security explanations, and best practices.",
          tip: "You can keep multiple accordions open at once to follow complex workflows."
        }
      ]
    },

    profile: {
      name: "Profile & Settings",
      icon: "icon-gear",
      badgeClass: "badge-pink",
      description: "Manage your personal credentials, appearance, and local database. Here is what each section does:",
      steps: [
        {
          badge: "ACCOUNT",
          pillClass: "pill-yellow",
          title: "User Credentials & Display Name",
          icon: "icon-shield",
          purpose: "Personalize your user profile and maintain your credentials.",
          how: "• Display Name: The name shown on your greeting and banner.\n• Username: Your unique local login handle.\n• Update Password: Change your local account security password.",
          tip: "Accounts are stored safely in local browser storage—no cloud telemetry or third-party servers."
        },
        {
          badge: "PREFERENCES",
          pillClass: "pill-purple",
          title: "Appearance & Currency Selection",
          icon: "icon-sun",
          purpose: "Customizes the visual design and financial currency formatting.",
          how: "• Theme Toggle: Switch between high-contrast Neo-Brutalism Light Mode and Dark Mode.\n• Currency Selector: Choose between Philippine Peso (₱), US Dollar ($), Euro (€), Pound (£), or Yen (¥).",
          tip: "The theme preference is remembered automatically every time you launch the application."
        },
        {
          badge: "DATA PRIVACY",
          pillClass: "pill-lime",
          title: "Data Backup, Sample Data & Reset",
          icon: "icon-download",
          purpose: "Gives you complete sovereignty and control over your financial records.",
          how: "• Export JSON: Download a full encrypted-ready backup of your database.\n• Import Backup: Restore records from any previously saved JSON file.\n• Load Sample Data: Pre-populates realistic demo data to explore features.\n• Reset Database: Securely wipes all entries and restores clean state.",
          tip: "Before making major changes or clearing your browser cache, always create an Export JSON backup."
        }
      ]
    }
  };

  /* ==========================================================
     STATE
     ========================================================== */
  let currentModuleKey = "dashboard";
  let currentStepIndex = 0;
  let isAutoLaunched = false;

  /* ==========================================================
     HELPERS
     ========================================================== */
  const qs = sel => document.querySelector(sel);
  const qsa = sel => Array.from(document.querySelectorAll(sel));

  function getGuide(moduleKey) {
    // Normalization for aliases
    const key = (moduleKey || "").toLowerCase();
    if (key === "entries") return MODULE_GUIDES.transactions;
    if (key === "analytics") return MODULE_GUIDES.reports;
    return MODULE_GUIDES[key] || MODULE_GUIDES.dashboard;
  }

  function hasSeenGuide(moduleKey) {
    try {
      return localStorage.getItem(STORAGE_PREFIX + moduleKey) === "true";
    } catch (e) {
      return false;
    }
  }

  function setSeenGuide(moduleKey, value = true) {
    try {
      localStorage.setItem(STORAGE_PREFIX + moduleKey, value ? "true" : "false");
    } catch (e) {}
  }

  /* ==========================================================
     RENDER CURRENT STEP IN MODAL
     ========================================================== */
  function render() {
    const guide = getGuide(currentModuleKey);
    const steps = guide.steps || [];
    const totalSteps = steps.length;
    if (currentStepIndex >= totalSteps) currentStepIndex = totalSteps - 1;
    if (currentStepIndex < 0) currentStepIndex = 0;

    const step = steps[currentStepIndex] || {};

    // 1. Module Name & Icon
    const modIcon = qs("#guideModuleIcon use");
    if (modIcon) modIcon.setAttribute("href", `#${guide.icon || "icon-grid"}`);

    const modName = qs("#guideModuleName");
    if (modName) modName.textContent = guide.name;

    const badgeWrap = qs("#guideModuleBadge");
    if (badgeWrap) {
      badgeWrap.className = `guide-module-badge ${guide.badgeClass || "badge-yellow"}`;
    }

    // 2. Step Counter & Progress Bar
    const counter = qs("#guideStepCounter");
    if (counter) counter.textContent = `Step ${currentStepIndex + 1} of ${totalSteps}`;

    const pBar = qs("#guideProgressBar");
    if (pBar) {
      const pct = Math.round(((currentStepIndex + 1) / totalSteps) * 100);
      pBar.style.width = `${pct}%`;
    }

    // 3. Step Dots
    const dotsWrap = qs("#guideStepDots");
    if (dotsWrap) {
      dotsWrap.innerHTML = steps.map((s, idx) => `
        <button type="button" 
          class="guide-dot ${idx === currentStepIndex ? "active" : ""}" 
          data-step-index="${idx}" 
          title="Jump to Step ${idx + 1}: ${Utils.escapeHtml(s.title)}"
          aria-label="Step ${idx + 1}">
          <span>${idx + 1}</span>
        </button>
      `).join("");

      dotsWrap.querySelectorAll(".guide-dot").forEach(btn => {
        btn.addEventListener("click", () => {
          const targetIdx = parseInt(btn.dataset.stepIndex, 10);
          if (!isNaN(targetIdx)) {
            currentStepIndex = targetIdx;
            render();
          }
        });
      });
    }

    // 4. Step Body Content
    const bodyEl = qs("#guideModalBody");
    if (bodyEl) {
      const formattedHow = Utils.escapeHtml(step.how || "")
        .replace(/\n• /g, '<br><strong>• </strong>')
        .replace(/\n/g, '<br>');

      bodyEl.innerHTML = `
        <div class="guide-component-card">
          <div class="guide-comp-head">
            <span class="guide-comp-badge ${step.pillClass || "pill-yellow"}">${Utils.escapeHtml(step.badge || "COMPONENT")}</span>
            <div class="guide-comp-icon-box">
              <svg class="icon"><use href="#${step.icon || "icon-info"}"></use></svg>
            </div>
            <h3 class="guide-comp-title">${Utils.escapeHtml(step.title || "")}</h3>
          </div>

          <div class="guide-detail-box guide-purpose-box">
            <div class="guide-box-header">
              <svg class="icon sm" aria-hidden="true"><use href="#icon-info"></use></svg>
              <span>PURPOSE &amp; FUNCTION</span>
            </div>
            <p class="guide-box-text">${Utils.escapeHtml(step.purpose || "")}</p>
          </div>

          <div class="guide-detail-box guide-how-box">
            <div class="guide-box-header">
              <svg class="icon sm" aria-hidden="true"><use href="#icon-play"></use></svg>
              <span>HOW TO USE &amp; DETAILS</span>
            </div>
            <div class="guide-box-text">${formattedHow}</div>
          </div>

          ${step.tip ? `
            <div class="guide-detail-box guide-tip-box">
              <div class="guide-box-header">
                <svg class="icon sm" aria-hidden="true"><use href="#icon-bulb"></use></svg>
                <span>PRO TIP</span>
              </div>
              <p class="guide-box-text">${Utils.escapeHtml(step.tip)}</p>
            </div>
          ` : ""}
        </div>
      `;
    }

    // 5. Navigation Buttons
    const btnPrev = qs("#guideBtnPrev");
    if (btnPrev) {
      btnPrev.disabled = currentStepIndex === 0;
    }

    const btnNext = qs("#guideBtnNext");
    if (btnNext) {
      if (currentStepIndex === totalSteps - 1) {
        btnNext.innerHTML = `<span>Finish Guide</span> <svg class="icon sm" aria-hidden="true"><use href="#icon-check"></use></svg>`;
        btnNext.className = "btn btn-primary btn-sm guide-btn-finish";
      } else {
        btnNext.innerHTML = `<span>Next</span> &rarr;`;
        btnNext.className = "btn btn-primary btn-sm";
      }
    }

    // 6. Checkbox state
    const chk = qs("#guideDontShowAgain");
    if (chk) {
      chk.checked = hasSeenGuide(currentModuleKey);
    }
  }

  /* ==========================================================
     OPEN / CLOSE / NAVIGATION
     ========================================================== */
  function open(moduleKey = "dashboard", isAuto = false) {
    const key = (moduleKey || "dashboard").toLowerCase();
    currentModuleKey = key;
    currentStepIndex = 0;
    isAutoLaunched = Boolean(isAuto);

    render();

    // Open modal via standard UI helper
    if (window.UI && typeof UI.openModal === "function") {
      UI.openModal("moduleGuideModal");
    } else {
      const el = document.getElementById("moduleGuideModal");
      if (el) el.hidden = false;
    }
  }

  function close() {
    const chk = qs("#guideDontShowAgain");
    if (chk && chk.checked) {
      setSeenGuide(currentModuleKey, true);
    }

    if (window.UI && typeof UI.closeModal === "function") {
      UI.closeModal("moduleGuideModal");
    } else {
      const el = document.getElementById("moduleGuideModal");
      if (el) el.hidden = true;
    }
  }

  function next() {
    const guide = getGuide(currentModuleKey);
    const totalSteps = (guide.steps || []).length;

    if (currentStepIndex < totalSteps - 1) {
      currentStepIndex++;
      render();
    } else {
      // Completed last step!
      setSeenGuide(currentModuleKey, true);
      close();
      if (window.UI && typeof UI.showToast === "function") {
        UI.showToast(`Completed the ${guide.name} tutorial. Reopen anytime via the Guide button!`, "success", "Tutorial Finished");
      }
    }
  }

  function prev() {
    if (currentStepIndex > 0) {
      currentStepIndex--;
      render();
    }
  }

  function checkFirstTime(moduleKey) {
    if (!moduleKey) return;
    const key = moduleKey.toLowerCase();
    // Do not show on landing or about
    if (key === "landing" || key === "about") return;

    if (!hasSeenGuide(key)) {
      // Small timeout so DOM is rendered and user sees page context
      setTimeout(() => {
        // Double check modal is not already open
        const modal = document.getElementById("moduleGuideModal");
        if (modal && modal.hidden) {
          open(key, true);
        }
      }, 350);
    }
  }

  /* ==========================================================
     EVENT INITIALIZATION
     ========================================================== */
  function init() {
    // Keyboard navigation when modal is open
    document.addEventListener("keydown", e => {
      const modal = document.getElementById("moduleGuideModal");
      if (!modal || modal.hidden) return;

      if (e.key === "ArrowRight") {
        e.preventDefault();
        next();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        prev();
      } else if (e.key === "Escape") {
        close();
      }
    });

    // Checkbox toggle listener
    const chk = qs("#guideDontShowAgain");
    if (chk) {
      chk.addEventListener("change", () => {
        setSeenGuide(currentModuleKey, chk.checked);
      });
    }
  }

  // Auto-init on script evaluation
  if (typeof document !== "undefined") {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", init);
    } else {
      init();
    }
  }

  return {
    open,
    close,
    next,
    prev,
    checkFirstTime,
    hasSeenGuide,
    setSeenGuide,
    MODULE_GUIDES
  };
})();
