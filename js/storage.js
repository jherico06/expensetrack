/* ============================================================
   storage.js
   LOCAL STORAGE
   ------------------------------------------------------------
   Handles everything that touches localStorage:
   loading, saving, exporting (CSV / JSON), importing
   (with structure validation) and resetting application data.
   ============================================================ */

const StorageService = {

  KEYS: {
    transactions: "ef_transactions",
    budgets: "ef_budgets",
    categories: "ef_categories",
    recurring: "ef_recurring",
    settings: "ef_settings"
  },

  /* ---------- LOAD ---------- */
  loadAll() {
    const read = key => {
      try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : null;
      } catch (error) {
        console.warn(`ExpenseFlow: could not read "${key}" from localStorage.`, error);
        return null;
      }
    };

    return {
      transactions: read(this.KEYS.transactions) || [],
      budgets: read(this.KEYS.budgets) || [],
      categories: read(this.KEYS.categories) || [],
      recurring: read(this.KEYS.recurring) || [],
      settings: read(this.KEYS.settings) || null
    };
  },

  /* ---------- SAVE ---------- */
  saveAll(state) {
    const write = (key, value) => {
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch (error) {
        console.warn(`ExpenseFlow: could not write "${key}" to localStorage.`, error);
      }
    };

    write(this.KEYS.transactions, state.transactions);
    write(this.KEYS.budgets, state.budgets);
    write(this.KEYS.categories, state.categories);
    write(this.KEYS.recurring, state.recurring);
    write(this.KEYS.settings, state.settings);
  },

  /* ---------- BOOTSTRAP ---------- */
  // called once when the application starts
  bootstrap() {
    const tracker = ExpenseTracker.getInstance();

    // Ensure all demo/created data is purged so the user starts with a clean, raw database
    if (!localStorage.getItem("ef_raw_initialized_v2")) {
      localStorage.removeItem(this.KEYS.transactions);
      localStorage.removeItem(this.KEYS.budgets);
      localStorage.removeItem(this.KEYS.recurring);
      localStorage.setItem("ef_raw_initialized_v2", "true");
    }

    const state = this.loadAll();
    tracker.hydrate(state);

    // first run: seed the protected default categories
    if (!tracker.getCategories().length) {
      tracker.hydrateCategories(DEFAULT_CATEGORIES.map(category => ({
        ...category,
        id: `cat_${Utils.uid()}`
      })));
      this.saveAll(tracker.snapshot());
    }

    return tracker;
  },

  /* ---------- EXPORT ---------- */
  exportJSON() {
    const snapshot = ExpenseTracker.getInstance().snapshot();
    return JSON.stringify({
      app: "ExpenseFlow",
      version: 1,
      exportedAt: new Date().toISOString(),
      transactions: snapshot.transactions,
      budgets: snapshot.budgets,
      categories: snapshot.categories,
      recurring: snapshot.recurring
    }, null, 2);
  },

  exportCSV() {
    const transactions = ExpenseTracker.getInstance().getTransactions();
    const rows = transactions.map(t => ({
      id: t.id,
      title: t.title,
      amount: t.amount,
      type: t.type,
      category: t.category,
      date: t.date,
      paymentMethod: t.paymentMethod,
      note: t.note,
      recurring: t.recurring,
      createdAt: t.createdAt
    }));
    return Utils.toCSV(rows);
  },

  /* ---------- IMPORT (validated) ---------- */
  importJSON(text) {
    let data;

    try {
      data = JSON.parse(text);
    } catch (error) {
      return { ok: false, error: "The file is not valid JSON." };
    }

    if (!data || typeof data !== "object" || Array.isArray(data)) {
      return { ok: false, error: "The file does not contain an ExpenseFlow object." };
    }

    if (!Array.isArray(data.transactions)) {
      return { ok: false, error: 'Missing required "transactions" array.' };
    }

    const validTransactions = data.transactions.every(t =>
      t && typeof t === "object" &&
      typeof t.title === "string" &&
      typeof t.amount === "number" &&
      (t.type === "income" || t.type === "expense")
    );

    if (!validTransactions) {
      return { ok: false, error: "One or more transactions have an invalid structure." };
    }

    const transactions = data.transactions.map(t => TransactionFactory.createTransaction(t));

    return {
      ok: true,
      state: {
        transactions,
        budgets: Array.isArray(data.budgets) ? data.budgets : [],
        categories: Array.isArray(data.categories) && data.categories.length
          ? data.categories
          : DEFAULT_CATEGORIES.map(category => ({ ...category, id: `cat_${Utils.uid()}` })),
        recurring: Array.isArray(data.recurring) ? data.recurring : []
      }
    };
  },

  /* ---------- RESET ---------- */
  resetAll() {
    Object.values(this.KEYS).forEach(key => localStorage.removeItem(key));
    localStorage.setItem("ef_raw_initialized_v2", "true");

    const tracker = ExpenseTracker.getInstance();
    tracker.hydrate({
      transactions: [],
      budgets: [],
      categories: [],
      recurring: [],
      settings: { theme: tracker.getSettings().theme, sidebarCollapsed: tracker.getSettings().sidebarCollapsed }
    });

    tracker.hydrateCategories(DEFAULT_CATEGORIES.map(category => ({
      ...category,
      id: `cat_${Utils.uid()}`
    })));

    this.saveAll(tracker.snapshot());
    return tracker;
  },

  /* ---------- SAMPLE DATA ---------- */
  loadSampleData() {
    const tracker = ExpenseTracker.getInstance();
    tracker.hydrateTransactions([]);
    tracker.hydrateBudgets([]);
    tracker.hydrateRecurring([]);
    this.saveAll(tracker.snapshot());
    return { transactions: [], budgets: [], recurring: [] };
  }
};

/* ============================================================
   AUTH SERVICE (LOCAL USER SESSION – NO 3RD-PARTY OAUTH)
   ============================================================ */
const AuthService = {
  SESSION_KEY: "ef_auth_session",
  PROFILE_KEY: "ef_user_profile",

  getSession() {
    try {
      const raw = localStorage.getItem(this.SESSION_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      console.warn("ExpenseFlow: could not parse auth session", e);
      return null;
    }
  },

  isAuthenticated() {
    return Boolean(this.getSession());
  },

  getInitials(name, fallback = "EF") {
    const target = (name || fallback || "EF").trim();
    const parts = target.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return target.slice(0, 2).toUpperCase();
  },

  getProfile() {
    const session = this.getSession();
    let profile = null;
    try {
      const raw = localStorage.getItem(this.PROFILE_KEY);
      if (raw) profile = JSON.parse(raw);
    } catch (e) {}

    const uname = session ? session.username : "student";
    const dname = session ? (session.displayName || session.username) : "Student Account";
    const avatar = session ? session.avatar : this.getInitials(dname, uname);

    if (!profile) {
      profile = {
        username: uname,
        displayName: dname,
        role: "Member",
        currency: "PHP",
        avatar: avatar || "EF",
        sessionStart: session ? session.loginAt : new Date().toISOString()
      };
      this.saveProfile(profile);
    } else if (session && session.username && profile.username !== session.username) {
      // Sync profile with currently authenticated session
      profile.username = session.username;
      profile.displayName = session.displayName || session.username;
      profile.avatar = session.avatar || this.getInitials(profile.displayName, profile.username);
      this.saveProfile(profile);
    }

    return profile;
  },

  saveProfile(profile) {
    try {
      const session = this.getSession();
      // keep the saved account in sync if the username was changed
      if (session && session.username && session.username !== profile.username) {
        const accounts = this.getAccounts();
        const oldKey = session.username.toLowerCase();
        if (accounts[oldKey]) {
          accounts[profile.username.toLowerCase()] = accounts[oldKey];
          delete accounts[oldKey];
          localStorage.setItem(this.ACCOUNTS_KEY, JSON.stringify(accounts));
        }
      }

      localStorage.setItem(this.PROFILE_KEY, JSON.stringify(profile));
      if (session) {
        session.username = profile.username;
        session.displayName = profile.displayName;
        session.avatar = profile.avatar || this.getInitials(profile.displayName, profile.username);
        localStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
      }
    } catch (e) {
      console.warn("ExpenseFlow: could not save profile", e);
    }
  },

  /* ---------- ACCOUNTS ---------- */
  ACCOUNTS_KEY: "ef_accounts",

  getAccounts() {
    try {
      const raw = localStorage.getItem(this.ACCOUNTS_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {}

    // Seed default starter account if no accounts exist yet
    const defaults = {
      "student": {
        password: this.hashPassword("password123"),
        displayName: "Student Account",
        createdAt: new Date().toISOString()
      }
    };
    try {
      localStorage.setItem(this.ACCOUNTS_KEY, JSON.stringify(defaults));
    } catch (e) {}
    return defaults;
  },

  // simple one-way scramble so the password is never saved as plain text
  hashPassword(password) {
    let hash = 5381;
    for (let i = 0; i < (password || "").length; i++) {
      hash = ((hash << 5) + hash + password.charCodeAt(i)) >>> 0;
    }
    return `h${hash.toString(36)}${(password || "").length}`;
  },

  isUsernameTaken(username, excludeUsername = null) {
    if (!username) return false;
    const clean = username.trim().toLowerCase();
    if (excludeUsername && clean === excludeUsername.trim().toLowerCase()) return false;
    const accounts = this.getAccounts();
    return Boolean(accounts[clean]);
  },

  register(displayName, username, password, confirmPassword) {
    const errors = { displayName: "", username: "", password: "", confirmPassword: "" };
    const cleanUser = (username || "").trim();
    const cleanName = (displayName || "").trim() || cleanUser;
    const pass = password || "";
    const confirm = confirmPassword !== undefined ? confirmPassword : pass;

    if (!cleanUser) {
      errors.username = "Please enter your username.";
    } else if (this.isUsernameTaken(cleanUser)) {
      errors.username = "This username is already taken.";
    }

    if (!pass) {
      errors.password = "Please enter your password.";
    } else if (pass.length < 4) {
      errors.password = "Password must be at least 4 characters.";
    }

    if (confirm !== pass) {
      errors.confirmPassword = "Passwords do not match.";
    }

    if (errors.username || errors.password || errors.confirmPassword) {
      return { ok: false, errors };
    }

    const key = cleanUser.toLowerCase();
    const accounts = this.getAccounts();
    accounts[key] = {
      password: this.hashPassword(pass),
      displayName: cleanName,
      createdAt: new Date().toISOString()
    };
    try {
      localStorage.setItem(this.ACCOUNTS_KEY, JSON.stringify(accounts));
    } catch (e) {}

    const initials = this.getInitials(cleanName, cleanUser);
    const now = new Date().toISOString();
    const session = {
      username: cleanUser,
      displayName: cleanName,
      role: "Member",
      avatar: initials,
      loginAt: now
    };
    try {
      localStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
    } catch (e) {}

    const profile = {
      username: cleanUser,
      displayName: cleanName,
      role: "Member",
      currency: "PHP",
      avatar: initials,
      sessionStart: now
    };
    this.saveProfile(profile);

    return { ok: true, session, profile };
  },

  login(username, password) {
    const errors = { username: "", password: "" };
    const cleanUser = (username || "").trim();
    const pass = password || "";

    if (!cleanUser) {
      errors.username = "Please enter your username.";
    }
    if (!pass) {
      errors.password = "Please enter your password.";
    }

    if (errors.username || errors.password) {
      return { ok: false, errors };
    }

    const key = cleanUser.toLowerCase();
    const accounts = this.getAccounts();

    if (!accounts[key]) {
      return { ok: false, errors: { username: "Username not found. Please register first.", password: "" } };
    }

    const hashed = this.hashPassword(pass);
    if (accounts[key].password !== hashed) {
      return { ok: false, errors: { username: "", password: "Incorrect password. Please try again." } };
    }

    const displayName = accounts[key].displayName || (cleanUser.charAt(0).toUpperCase() + cleanUser.slice(1));
    const initials = this.getInitials(displayName, cleanUser);
    const now = new Date().toISOString();

    const session = {
      username: cleanUser,
      displayName: displayName,
      role: "Member",
      avatar: initials,
      loginAt: now
    };
    try {
      localStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
    } catch (e) {}

    const existing = this.getProfile();
    existing.displayName = displayName;
    existing.username = cleanUser;
    existing.avatar = initials;
    existing.sessionStart = now;
    this.saveProfile(existing);

    return { ok: true, session };
  },

  logout() {
    localStorage.removeItem(this.SESSION_KEY);
    return { ok: true };
  }
};

