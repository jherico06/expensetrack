/* ============================================================
   utils.js – shared helper functions
   Formatting, dates, escaping, DOM shortcuts
   ============================================================ */

const Utils = (() => {

  const currencyFormat = new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  const wholeFormat = new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });

  const MONTH_NAMES = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  function formatCurrency(value) {
    const amount = Number(value) || 0;
    return currencyFormat.format(amount);
  }

  function formatWhole(value) {
    const amount = Number(value) || 0;
    return wholeFormat.format(amount);
  }

  function pad(number) {
    return String(number).padStart(2, "0");
  }

  function todayISO() {
    const now = new Date();
    return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  }

  // date-only strings ("YYYY-MM-DD") are parsed locally to avoid UTC shifts
  function parseDate(iso) {
    if (!iso) return new Date(NaN);
    const datePart = String(iso).slice(0, 10);
    const [year, month, day] = datePart.split("-").map(Number);
    return new Date(year, (month || 1) - 1, day || 1);
  }

  function formatDate(iso) {
    const date = parseDate(iso);
    if (Number.isNaN(date.getTime())) return "—";
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  }

  function formatShortDate(iso) {
    const date = parseDate(iso);
    if (Number.isNaN(date.getTime())) return "—";
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }

  function formatDateTime(iso) {
    if (!iso) return "—";
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return formatDate(iso);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit"
    });
  }

  function monthKey(year, month) {
    return `${year}-${pad(month + 1)}`;
  }

  function monthLabel(year, month) {
    return `${MONTH_NAMES[month]} ${year}`;
  }

  function monthName(month) {
    return MONTH_NAMES[month] || "";
  }

  function monthIndexFromKey(key) {
    const [year, month] = key.split("-").map(Number);
    return { year, month: month - 1 };
  }

  function monthRange(year, month) {
    const start = `${year}-${pad(month + 1)}-01`;
    const lastDay = new Date(year, month + 1, 0).getDate();
    const end = `${year}-${pad(month + 1)}-${pad(lastDay)}`;
    return { start, end };
  }

  function addDays(iso, days) {
    const date = parseDate(iso);
    date.setDate(date.getDate() + days);
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  }

  function addMonthsKey(key, delta) {
    const { year, month } = monthIndexFromKey(key);
    const date = new Date(year, month + delta, 1);
    return monthKey(date.getFullYear(), date.getMonth());
  }

  function shiftMonth(year, month, delta) {
    const date = new Date(year, month + delta, 1);
    return { year: date.getFullYear(), month: date.getMonth() };
  }

  function daysInMonth(year, month) {
    return new Date(year, month + 1, 0).getDate();
  }

  function compareDates(a, b) {
    if (a === b) return 0;
    return a < b ? -1 : 1;
  }

  function getGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function debounce(callback, delay = 250) {
    let timer;
    return function debounced(...args) {
      clearTimeout(timer);
      timer = setTimeout(() => callback.apply(this, args), delay);
    };
  }

  function uid() {
    if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
    return `tx_${Date.now()}_${Math.random().toString(16).slice(2)}`;
  }

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  function qs(selector, scope = document) {
    return scope.querySelector(selector);
  }

  function qsa(selector, scope = document) {
    return Array.from(scope.querySelectorAll(selector));
  }

  function downloadFile(filename, content, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 500);
  }

  function toCSV(rows) {
    if (!rows.length) return "";
    const headers = Object.keys(rows[0]);
    const escapeCell = value => {
      const text = String(value ?? "");
      return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
    };
    const lines = [headers.join(",")];
    rows.forEach(row => {
      lines.push(headers.map(header => escapeCell(row[header])).join(","));
    });
    return lines.join("\n");
  }

  const EMOJI_TO_LUCIDE = {
    "🍔": "utensils", "🚗": "car", "📚": "graduation-cap", "🧾": "receipt",
    "🛍️": "shopping-bag", "🛍": "shopping-bag", "🎬": "clapperboard", "🏥": "heart-pulse",
    "💇": "scissors", "📱": "smartphone", "✈️": "plane", "✈": "plane",
    "📦": "package", "💼": "briefcase", "🎒": "wallet", "💻": "laptop",
    "🏢": "building-2", "🎁": "gift", "💰": "coins", "☕": "coffee",
    "🎮": "gamepad-2", "🏠": "home", "🏋️": "dumbbell", "🏋": "dumbbell",
    "🐾": "paw-print", "💡": "lightbulb", "🎵": "music"
  };

  function normalizeIcon(name) {
    if (!name) return "package";
    return EMOJI_TO_LUCIDE[name] || name;
  }

  function renderCategoryIcon(iconName, className = "cat-icon") {
    const icon = normalizeIcon(iconName);
    const symbolExists = typeof document !== "undefined" && document.getElementById(`lucide-${icon}`);
    if (symbolExists || typeof document === "undefined") {
      return `<svg class="${className}" aria-hidden="true" focusable="false"><use href="#lucide-${icon}"></use></svg>`;
    }
    if (typeof window !== "undefined" && window.lucide && window.lucide.icons) {
      const camel = icon.replace(/-([a-z])/g, g => g[1].toUpperCase());
      const iconDef = window.lucide.icons[camel] || window.lucide.icons[icon];
      if (iconDef && typeof iconDef.toSvg === "function") {
        return iconDef.toSvg({ class: className, "aria-hidden": "true", focusable: "false" });
      }
    }
    return `<svg class="${className}" aria-hidden="true" focusable="false"><use href="#lucide-${icon}"></use></svg>`;
  }

  function percentage(part, total) {
    if (!total) return 0;
    return Math.round((part / total) * 100);
  }

  return {
    formatCurrency,
    formatWhole,
    todayISO,
    parseDate,
    formatDate,
    formatShortDate,
    formatDateTime,
    monthKey,
    monthLabel,
    monthName,
    monthIndexFromKey,
    monthRange,
    addDays,
    addMonthsKey,
    shiftMonth,
    daysInMonth,
    compareDates,
    getGreeting,
    escapeHtml,
    debounce,
    uid,
    clamp,
    qs,
    qsa,
    downloadFile,
    toCSV,
    percentage,
    normalizeIcon,
    renderCategoryIcon,
    EMOJI_TO_LUCIDE
  };
})();

