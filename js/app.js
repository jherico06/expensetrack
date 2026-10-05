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
    if (window.ModuleGuide && AuthService.isAuthenticated()) {
      ModuleGuide.checkFirstTime(page);
    }
  }

  function navigate(page) {
    const target = `#/${page}`;
    if (location.hash === target) {
      route();
    } else {
      location.hash = target; // triggers hashchange -> route()
    }
  }

  /* ---------- FORM FIELD HELPERS ---------- */
  // shows (or clears) an error message directly under a field
  function setFieldError(input, message) {
    if (!input) return;
    const group = input.closest(".form-group");
    let errorEl = input.getAttribute("aria-describedby")
      ? document.getElementById(input.getAttribute("aria-describedby"))
      : null;

    if (!errorEl && group && message) {
      errorEl = group.querySelector(".field-error");
      if (!errorEl) {
        errorEl = document.createElement("small");
        errorEl.className = "field-error";
        errorEl.id = `${input.id}Error`;
        errorEl.setAttribute("role", "alert");
        group.appendChild(errorEl);
      }
      input.setAttribute("aria-describedby", errorEl.id);
    }

    if (errorEl) {
      errorEl.textContent = message || "";
      errorEl.hidden = !message;
    }
    input.classList.toggle("is-invalid", Boolean(message));
    input.setAttribute("aria-invalid", message ? "true" : "false");
  }

  function resetLoginForm() {
    const form = document.getElementById("authForm");
    if (form) {
      form.reset();
      form.querySelectorAll("input").forEach(input => setFieldError(input, ""));
    }
    const regForm = document.getElementById("registerForm");
    if (regForm) {
      regForm.reset();
      regForm.querySelectorAll("input").forEach(input => setFieldError(input, ""));
    }
    document.querySelectorAll(".password-wrap input").forEach(pass => {
      pass.type = "password";
    });
    document.querySelectorAll(".password-toggle").forEach(toggle => {
      toggle.classList.remove("is-visible");
      toggle.setAttribute("aria-pressed", "false");
      toggle.setAttribute("aria-label", "Show password");
      toggle.title = "Show password";
    });
  }

  /* ---------- AUTH & VIEW VISIBILITY ---------- */
  function toggleAppAuth(authenticated) {
    const landingEl = document.getElementById("landingPage");
    const appEl = document.querySelector(".app");

    if (authenticated) {
      if (landingEl) landingEl.hidden = true;
      if (appEl) appEl.hidden = false;
      UI.updateAuthUI();
      route();
    } else {
      if (landingEl) landingEl.hidden = false;
      if (appEl) appEl.hidden = true;
      window.scrollTo({ top: 0, behavior: "smooth" });
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

      case "go-profile":
        navigate("profile");
        break;

      case "view-landing":
        toggleAppAuth(false);
        break;

      case "focus-login": {
        const inp = document.getElementById("loginUsername");
        if (inp) {
          inp.focus();
          inp.scrollIntoView({ behavior: "smooth", block: "center" });
        }
        break;
      }

      case "switch-auth-tab": {
        const tab = element.dataset.tab;
        const signInForm = document.getElementById("authForm");
        const registerForm = document.getElementById("registerForm");
        const tabSignIn = document.getElementById("tabSignIn");
        const tabRegister = document.getElementById("tabRegister");
        const headH2 = document.getElementById("authCardTitle");
        const headP = document.getElementById("authCardDesc");

        if (tab === "register") {
          if (signInForm) signInForm.hidden = true;
          if (registerForm) registerForm.hidden = false;
          if (tabSignIn) { tabSignIn.classList.remove("active"); tabSignIn.setAttribute("aria-selected", "false"); }
          if (tabRegister) { tabRegister.classList.add("active"); tabRegister.setAttribute("aria-selected", "true"); }
          if (headH2) headH2.textContent = "Create an Account";
          if (headP) headP.textContent = "Register with a username and password to start tracking your finances.";
          const regUser = document.getElementById("regUsername");
          if (regUser) regUser.focus();
        } else {
          if (signInForm) signInForm.hidden = false;
          if (registerForm) registerForm.hidden = true;
          if (tabSignIn) { tabSignIn.classList.add("active"); tabSignIn.setAttribute("aria-selected", "true"); }
          if (tabRegister) { tabRegister.classList.remove("active"); tabRegister.setAttribute("aria-selected", "false"); }
          if (headH2) headH2.textContent = "Welcome Back";
          if (headP) headP.textContent = "Sign in with your username and password to continue managing your finances.";
          const logUser = document.getElementById("loginUsername");
          if (logUser) logUser.focus();
        }
        break;
      }

      case "toggle-password": {
        const input = document.getElementById(element.dataset.target);
        if (!input) break;
        const show = input.type === "password";
        input.type = show ? "text" : "password";
        element.classList.toggle("is-visible", show);
        element.setAttribute("aria-pressed", String(show));
        element.setAttribute("aria-label", show ? "Hide password" : "Show password");
        element.title = show ? "Hide password" : "Show password";
        input.focus();
        break;
      }

      case "logout": {
        UI.confirmAction({
          title: "Log out?",
          message: "You will need your username and password to sign in again.",
          confirmText: "Log Out",
          danger: true
        }).then(confirmed => {
          if (!confirmed) return;
          AuthService.logout();
          resetLoginForm();
          toggleAppAuth(false);
          UI.showToast("You have been logged out.", "info", "Goodbye");
        });
        break;
      }

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

      /* --- module guide & tutorial --- */
      case "open-module-guide": {
        const mod = element.dataset.module || UI.currentPage || "dashboard";
        if (window.ModuleGuide) ModuleGuide.open(mod);
        break;
      }

      case "close-guide-modal":
        if (window.ModuleGuide) ModuleGuide.close();
        break;

      case "guide-next":
        if (window.ModuleGuide) ModuleGuide.next();
        break;

      case "guide-prev":
        if (window.ModuleGuide) ModuleGuide.prev();
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
          if (action !== "toggle-notifications" && !actionElement.closest("#notifPanel")) {
            UI.closeNotifications();
          }
        }
        return;
      }

      // outside click behaviour
      if (!event.target.closest("#notifPanel") && !event.target.closest(".dropdown-wrap")) {
        UI.closeNotifications();
      }
      if (!event.target.closest(".action-menu")) {
        UI.closeActionMenus();
      }
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

    // Sign-in form with clean validation
    const authForm = document.getElementById("authForm");
    if (authForm) {
      const uInp = document.getElementById("loginUsername");
      const pInp = document.getElementById("loginPassword");

      [uInp, pInp].forEach(input => {
        if (input) input.addEventListener("input", () => setFieldError(input, ""));
      });

      authForm.addEventListener("submit", event => {
        event.preventDefault();
        const res = AuthService.login(uInp.value, pInp.value);

        if (!res.ok) {
          setFieldError(uInp, res.errors.username);
          setFieldError(pInp, res.errors.password);
          (res.errors.username ? uInp : pInp).focus();
          return;
        }

        resetLoginForm();
        toggleAppAuth(true);
        navigate("dashboard");
        UI.showToast(`Welcome back, ${res.session.displayName}!`, "success", "Signed in");
      });
    }

    // Registration form with username availability checking
    const registerForm = document.getElementById("registerForm");
    if (registerForm) {
      const regName = document.getElementById("regDisplayName");
      const regUser = document.getElementById("regUsername");
      const regPass = document.getElementById("regPassword");
      const regConfirm = document.getElementById("regConfirmPassword");

      [regName, regUser, regPass, regConfirm].forEach(input => {
        if (input) input.addEventListener("input", () => setFieldError(input, ""));
      });

      registerForm.addEventListener("submit", event => {
        event.preventDefault();
        const res = AuthService.register(
          regName ? regName.value : "",
          regUser ? regUser.value : "",
          regPass ? regPass.value : "",
          regConfirm ? regConfirm.value : ""
        );

        if (!res.ok) {
          if (res.errors.displayName) setFieldError(regName, res.errors.displayName);
          if (res.errors.username) setFieldError(regUser, res.errors.username);
          if (res.errors.password) setFieldError(regPass, res.errors.password);
          if (res.errors.confirmPassword) setFieldError(regConfirm, res.errors.confirmPassword);

          if (res.errors.username) regUser.focus();
          else if (res.errors.password) regPass.focus();
          else if (res.errors.confirmPassword) regConfirm.focus();
          return;
        }

        resetLoginForm();
        toggleAppAuth(true);
        navigate("dashboard");
        UI.showToast(`Welcome to ExpenseFlow, ${res.session.displayName}! Your account is ready.`, "success", "Account created");
      });
    }

    // Profile form with strict single-purpose warnings (empty or already taken)
    const profileForm = document.getElementById("profileForm");
    if (profileForm) {
      const inpName = document.getElementById("profileInputName");
      const inpUser = document.getElementById("profileInputUser");
      const inpCurr = document.getElementById("profileInputCurrency");

      [inpName, inpUser].forEach(input => {
        if (input) input.addEventListener("input", () => setFieldError(input, ""));
      });

      profileForm.addEventListener("submit", event => {
        event.preventDefault();
        const profile = AuthService.getProfile();
        const name = (inpName ? inpName.value : "").trim();
        const user = (inpUser ? inpUser.value : "").trim();

        let nameError = "";
        if (!name) nameError = "Please enter your display name.";

        let userError = "";
        if (!user) {
          userError = "Please enter your username.";
        } else if (AuthService.isUsernameTaken(user, profile.username)) {
          userError = "This username is already taken.";
        }

        setFieldError(inpName, nameError);
        setFieldError(inpUser, userError);
        if (nameError || userError) {
          (nameError ? inpName : inpUser).focus();
          return;
        }

        profile.displayName = name;
        profile.username = user;
        profile.currency = inpCurr ? inpCurr.value : "PHP";
        profile.avatar = (user.slice(0, 2) || "EF").toUpperCase();

        AuthService.saveProfile(profile);
        UI.updateAuthUI();
        UI.renderHeader();
        UI.showToast("Your profile has been updated.", "success", "Profile");
      });
    }
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

    // Check local authentication session (Direct username/password, no 3rd-party)
    const isAuth = AuthService.isAuthenticated();
    toggleAppAuth(isAuth);

    if (isAuth) {
      route();
      UI.renderAll();
    }

    // surface due recurring payments on load
    const due = tracker.getDueRecurring();
    if (due.length && isAuth) {
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
