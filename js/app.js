/* ============================================================
   app.js
   EVENT LISTENERS – bootstrap, hash router and global bindings
   ============================================================ */

const App = (() => {

  /* ---------- ROUTER ---------- */
  function route() {
    const raw = (location.hash || "").replace(/^#\/?/, "");
    const page = UI.PAGES.includes(raw) ? raw : "dashboard";
    UI.setActivePage(page);
  }

  function navigate(page) {
    const target = `#/${page}`;
    if (location.hash === target) {
      route();
    } else {
      location.hash = target; // triggers hashchange -> route()
    }
  }

  /* ---------- EVENT: DATA-ACTION DELEGATION ---------- */
  function handleAction(action, element, event) {
    const tracker = ExpenseTracker.getInstance();
    const id = element.dataset.id;

    switch (action) {
      /* --- navigation --- */
      case "nav":
        UI.closeNotifications();
        break;

      case "go-transactions":
        navigate("transactions");
        break;

      case "focus-search":
        navigate("transactions");
        setTimeout(() => {
          const input = document.getElementById("searchInput");
          if (input) input.focus();
        }, 120);
        break;

      /* --- sidebar --- */
      case "toggle-sidebar":
      case "open-sidebar":
      case "close-sidebar":
        UI.toggleSidebar(action === "open-sidebar" ? true : action === "close-sidebar" ? false : undefined);
        break;

      /* --- header --- */
      case "toggle-notifications":
        UI.toggleNotifications();
        break;

      case "toggle-theme":
        UI.toggleTheme();
        break;

      case "set-theme":
        UI.setTheme(element.dataset.themeValue);
        UI.renderPage(UI.currentPage);
        UI.showToast(
          `${element.dataset.themeValue === "dark" ? "Dark" : "Light"} theme enabled.`,
          "info",
          "Appearance"
        );
        break;

      /* --- month selector --- */
      case "month-prev": UI.shiftMonth(-1); break;
      case "month-next": UI.shiftMonth(1); break;
      case "month-current": UI.goToCurrentMonth(); break;

      /* --- transactions --- */
      case "open-add-transaction":
        event.preventDefault();
        UI.openTransactionModal();
        break;

      case "toggle-filters": {
        const panel = document.getElementById("filterPanel");
        panel.hidden = !panel.hidden;
        element.setAttribute("aria-expanded", String(!panel.hidden));
        break;
      }

      case "clear-filters":
        UI.closeActionMenus();
        UI.clearFilters();
        break;

      case "toggle-menu":
        UI.toggleActionMenu(id);
        break;

      case "tx-view":
        UI.closeActionMenus();
        UI.openDetails(id);
        break;

      case "tx-edit": {
        const transaction = tracker.getTransaction(id);
        if (transaction) {
          UI.closeActionMenus();
          UI.closeModal("detailsModal");
          UI.openTransactionModal(transaction);
        }
        break;
      }

      case "tx-duplicate":
        UI.duplicateTransactionFlow(id);
        break;

      case "tx-delete":
        UI.deleteTransactionFlow(id);
        break;

      /* --- budgets --- */
      case "budget-add":
        UI.openBudgetModal(element.dataset.scope || "monthly");
        break;

      case "budget-edit-monthly":
        UI.openBudgetModal("monthly");
        break;

      case "budget-edit":
        UI.openBudgetModal("category", id);
        break;

      case "budget-delete":
        UI.deleteBudgetFlow(id);
        break;

      /* --- categories --- */
      case "category-add":
        UI.openCategoryModal();
        break;

      case "category-edit":
        UI.openCategoryModal(id);
        break;

      case "category-delete":
        UI.deleteCategoryFlow(id);
        break;

      /* --- recurring --- */
      case "recurring-add":
        UI.openRecurringModal();
        break;

      case "recurring-edit":
        UI.openRecurringModal(id);
        break;

      case "recurring-delete":
        UI.deleteRecurringFlow(id);
        break;

      case "recurring-toggle": {
        const item = tracker.getRecurringItem(id);
        if (item) {
          tracker.updateRecurring(id, { paused: !item.paused });
          UI.showToast(
            item.paused ? `"${item.name}" resumed.` : `"${item.name}" paused.`,
            "success",
            "Recurring"
          );
          UI.renderAll();
        }
        break;
      }

      case "recurring-generate":
        UI.generateDueTransactions();
        break;

      /* --- data management --- */
      case "export-csv":
        UI.exportTransactions("csv");
        break;

      case "export-json":
        UI.exportTransactions("json");
        break;

      case "import-json":
        document.getElementById("importFile").click();
        break;

      case "load-sample":
        UI.loadSampleDataFlow();
        break;

      case "reset-data":
        UI.resetDataFlow();
        break;

      /* --- modals --- */
      case "close-modal":
        UI.closeModal(element.closest(".modal-root")?.id);
        break;

      case "confirm-ok":
        UI.settleConfirm(true);
        break;

      case "confirm-cancel":
        UI.settleConfirm(false);
        break;

      default:
        break;
    }
  }

  /* ---------- EVENT BINDINGS ---------- */
  function bindEvents() {

    // EVENT LISTENERS – global click delegation for [data-action]
    document.addEventListener("click", event => {
      const actionElement = event.target.closest("[data-action]");

      if (actionElement) {
        const action = actionElement.dataset.action;
        handleAction(action, actionElement, event);
        if (action !== "toggle-menu" && action !== "toggle-notifications") {
          // close open menus unless the action manages them itself
          if (!actionElement.closest(".action-menu")) UI.closeActionMenus();
          if (action !== "toggle-notifications") UI.closeNotifications();
        }
        return;
      }

      // outside click behaviour
      UI.closeActionMenus();
      UI.closeNotifications();
    });

    // hash router
    window.addEventListener("hashchange", route);

    // EVENT LISTENERS – search (real-time, debounced)
    const searchInput = document.getElementById("searchInput");
    searchInput.addEventListener("input",
      Utils.debounce(event => UI.setSearch(event.target.value), 180)
    );

    // EVENT LISTENERS – sorting (STRATEGY selected by the user)
    document.getElementById("sortSelect").addEventListener("change", event => {
      UI.setSort(event.target.value);
    });

    // EVENT LISTENERS – advanced filters
    const filterPanel = document.getElementById("filterPanel");
    filterPanel.addEventListener("change", event => {
      if (event.target.id === "filterDateRange") {
        document.getElementById("customRangeWrap").hidden = event.target.value !== "custom";
      }
      UI.syncFiltersFromForm();
    });
    filterPanel.addEventListener("input", event => {
      if (event.target.type === "number" || event.target.type === "date") {
        UI.syncFiltersFromForm();
      }
    });

    // EVENT LISTENERS – transaction form
    document.getElementById("transactionForm").addEventListener("submit", event => {
      event.preventDefault();
      UI.saveTransaction();
    });

    document.getElementById("txType").addEventListener("change", event => {
      UI.populateCategorySelect(document.getElementById("txCategory"), event.target.value);
    });

    // EVENT LISTENERS – budget form
    document.getElementById("budgetForm").addEventListener("submit", event => {
      event.preventDefault();
      UI.saveBudget();
    });

    document.getElementById("budgetScope").addEventListener("change", event => {
      document.getElementById("budgetCategoryWrap").hidden = event.target.value !== "category";
      document.getElementById("budgetModalTitle").textContent =
        event.target.value === "monthly" ? "Set Monthly Budget" : "Set Category Budget";
    });

    // EVENT LISTENERS – category form
    document.getElementById("categoryForm").addEventListener("submit", event => {
      event.preventDefault();
      UI.saveCategory();
    });

    // EVENT LISTENERS – recurring form
    document.getElementById("recurringForm").addEventListener("submit", event => {
      event.preventDefault();
      UI.saveRecurring();
    });

    document.getElementById("recType").addEventListener("change", event => {
      UI.populateCategorySelect(document.getElementById("recCategory"), event.target.value);
    });

    // EVENT LISTENERS – import file
    document.getElementById("importFile").addEventListener("change", event => {
      const file = event.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = () => UI.importTransactions(String(reader.result));
      reader.onerror = () => UI.showToast("The file could not be read.", "error", "Import failed");
      reader.readAsText(file);
      event.target.value = "";
    });

    // EVENT LISTENERS – icon picker (delegated inside the modal)
    document.getElementById("iconPicker").addEventListener("click", event => {
      const option = event.target.closest(".icon-option");
      if (option) UI.selectIcon(option.dataset.icon);
    });

    // EVENT LISTENERS – keyboard support
    document.addEventListener("keydown", event => {
      if (event.key === "Escape") {
        const openMenu = document.querySelector(".action-menu");
        if (openMenu) {
          UI.closeActionMenus();
          return;
        }
        const notifPanel = document.getElementById("notifPanel");
        if (!notifPanel.hidden) {
          UI.closeNotifications();
          return;
        }
        UI.closeTopModal();
      }

      // keyboard access for clickable recent rows
      if ((event.key === "Enter" || event.key === " ") &&
          event.target.classList.contains("recent-item")) {
        event.preventDefault();
        UI.openDetails(event.target.dataset.id);
      }
    });

    // EVENT LISTENERS – responsive sidebar reset
    let lastWidth = window.innerWidth;
    window.addEventListener("resize", () => {
      const crossedBreakpoint =
        (lastWidth <= 992 && window.innerWidth > 992) ||
        (lastWidth > 992 && window.innerWidth <= 992);

      if (crossedBreakpoint) {
        document.body.classList.remove("sidebar-open");
      }
      lastWidth = window.innerWidth;
    });

    // sidebar navigation links (mobile: close drawer after navigation)
    document.querySelectorAll(".nav-link[data-page]").forEach(link => {
      link.addEventListener("click", () => {
        if (window.innerWidth <= 992) document.body.classList.remove("sidebar-open");
      });
    });
  }

  /* ---------- BOOT ---------- */
  function init() {
    // LOCAL STORAGE – hydrate the Singleton manager
    const tracker = StorageService.bootstrap();

    // theme + collapsed sidebar preferences
    const settings = tracker.getSettings();
    UI.setTheme(settings.theme || "dark", false);
    if (settings.sidebarCollapsed && window.innerWidth > 992) {
      document.body.classList.add("sidebar-collapsed");
    }

    UI.renderFilterOptions();
    bindEvents();
    route();
    UI.renderAll();

    // surface due recurring payments on load
    const due = tracker.getDueRecurring();
    if (due.length) {
      setTimeout(() => {
        UI.showToast(
          `${due.length} recurring payment${due.length > 1 ? "s are" : " is"} due. Open Recurring to generate them.`,
          "warning",
          "Recurring expenses"
        );
      }, 700);
    }
  }

  return { init, navigate, route };
})();

document.addEventListener("DOMContentLoaded", App.init);
