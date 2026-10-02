/* ============================================================
   data/sampleData.js
   Demo data for classroom presentation.
   Loaded from Settings → "Load Sample Data".
   Every transaction is created through the FACTORY.
   ============================================================ */

const SampleData = (() => {

  function buildDate(monthOffset, day) {
    const now = new Date();
    const base = new Date(now.getFullYear(), now.getMonth() + monthOffset, 1);
    const daysInTarget = Utils.daysInMonth(base.getFullYear(), base.getMonth());
    const targetDay = Utils.clamp(day, 1, daysInTarget);
    return Utils.monthKey(base.getFullYear(), base.getMonth()) + "-" + String(targetDay).padStart(2, "0");
  }

  // current-month records, mapped across the days already elapsed
  function currentMonthTransactions() {
    const today = new Date();
    const elapsed = Math.max(today.getDate(), 1);
    const records = currentMonthRecords();
    const total = records.length;

    return records.map((record, index) => ({
      ...record,
      date: total === 1
        ? buildDate(0, 1)
        : buildDate(0, 1 + Math.round((index * (elapsed - 1)) / (total - 1)))
    }));
  }

  function currentMonthRecords() {
    return [
      // ---- INCOME ----
      { title: "Allowance", amount: 5000, type: "income", category: "Allowance", paymentMethod: "GCash", note: "Monthly allowance" },
      { title: "Freelance Project", amount: 3500, type: "income", category: "Freelance", paymentMethod: "Bank Transfer", note: "Logo design gig" },
      { title: "Salary", amount: 25000, type: "income", category: "Salary", paymentMethod: "Bank Transfer", note: "Semi-monthly payout" },

      // ---- EXPENSES ----
      { title: "Lunch", amount: 150, type: "expense", category: "Food", paymentMethod: "Cash", note: "Cafeteria lunch" },
      { title: "Transportation", amount: 80, type: "expense", category: "Transportation", paymentMethod: "Cash", note: "Jeepney fare" },
      { title: "Internet Bill", amount: 1499, type: "expense", category: "Bills", paymentMethod: "Bank Transfer", note: "Fiber plan", recurring: true },
      { title: "School Supplies", amount: 650, type: "expense", category: "School", paymentMethod: "Debit Card", note: "Bond paper, pen, folders" },
      { title: "Groceries", amount: 1250, type: "expense", category: "Food", paymentMethod: "Debit Card", note: "Weekly groceries" },
      { title: "Water & Electric Bill", amount: 850, type: "expense", category: "Bills", paymentMethod: "GCash", note: "Utilities" },
      { title: "Netflix Subscription", amount: 549, type: "expense", category: "Subscription", paymentMethod: "Credit Card", note: "Standard plan", recurring: true },
      { title: "Coffee", amount: 180, type: "expense", category: "Food", paymentMethod: "GCash", note: "Cafe latte" },
      { title: "Ride to School", amount: 120, type: "expense", category: "Transportation", paymentMethod: "GCash", note: "Angkas fare" },
      { title: "Mobile Load", amount: 299, type: "expense", category: "Subscription", paymentMethod: "GCash", note: "Data promos", recurring: true },
      { title: "Printouts & Notes", amount: 120, type: "expense", category: "School", paymentMethod: "Cash", note: "Project printouts" },
      { title: "Movie Tickets", amount: 600, type: "expense", category: "Entertainment", paymentMethod: "GCash", note: "Cinema for two" },
      { title: "Restaurant Dinner", amount: 870, type: "expense", category: "Food", paymentMethod: "Credit Card", note: "Family dinner" },
      { title: "Bus Fare", amount: 140, type: "expense", category: "Transportation", paymentMethod: "Cash", note: "Commute" },
      { title: "Fare Allowance", amount: 350, type: "expense", category: "Transportation", paymentMethod: "Cash", note: "Weekly commute budget" },
      { title: "Taxi Ride", amount: 250, type: "expense", category: "Transportation", paymentMethod: "Maya", note: "Late night ride" },
      { title: "Pharmacy", amount: 420, type: "expense", category: "Health", paymentMethod: "Cash", note: "Vitamins" },
      { title: "Sneakers", amount: 1850, type: "expense", category: "Shopping", paymentMethod: "Credit Card", note: "New everyday pair" },
      { title: "Spotify Premium", amount: 154, type: "expense", category: "Subscription", paymentMethod: "Credit Card", note: "Student plan", recurring: true },
      { title: "Concert Ticket", amount: 1100, type: "expense", category: "Entertainment", paymentMethod: "GCash", note: "Year-end concert" },
      { title: "Gym Membership", amount: 1000, type: "expense", category: "Health", paymentMethod: "Debit Card", note: "Monthly dues" },
      { title: "Weekend Brunch", amount: 450, type: "expense", category: "Food", paymentMethod: "Credit Card", note: "Brunch with friends" },
      { title: "Gift for Friend", amount: 500, type: "expense", category: "Other", paymentMethod: "Cash", note: "Birthday gift" },
      { title: "Food Delivery", amount: 350, type: "expense", category: "Food", paymentMethod: "GCash", note: "Late night order" },
      { title: "Haircut", amount: 250, type: "expense", category: "Personal", paymentMethod: "Cash", note: "Barber shop" },
      { title: "Fuel Refill", amount: 800, type: "expense", category: "Transportation", paymentMethod: "Credit Card", note: "Motorcycle fuel" },
      { title: "Graphic Tees", amount: 450, type: "expense", category: "Shopping", paymentMethod: "GCash", note: "Two shirts on sale" },
      { title: "Parking Fee", amount: 60, type: "expense", category: "Transportation", paymentMethod: "Cash", note: "Mall parking" },
      { title: "Bowling Night", amount: 450, type: "expense", category: "Entertainment", paymentMethod: "Maya", note: "Friday night out" },
      { title: "Textbook", amount: 480, type: "expense", category: "School", paymentMethod: "Debit Card", note: "Major subject" }
    ];
  }

  // history used by the reports / comparison charts
  function previousMonthTransactions(monthsBack, multiplier) {
    const records = [
      { title: "Allowance", amount: 5000, type: "income", category: "Allowance", paymentMethod: "GCash" },
      { title: "Salary", amount: 25000, type: "income", category: "Salary", paymentMethod: "Bank Transfer" },
      { title: "Freelance Project", amount: 3500, type: "income", category: "Freelance", paymentMethod: "Bank Transfer" },
      { title: "Internet Bill", amount: 1499, type: "expense", category: "Bills", paymentMethod: "Bank Transfer", recurring: true },
      { title: "Netflix Subscription", amount: 549, type: "expense", category: "Subscription", paymentMethod: "Credit Card", recurring: true },
      { title: "Groceries", amount: 1450, type: "expense", category: "Food", paymentMethod: "Debit Card" },
      { title: "Lunch", amount: 480, type: "expense", category: "Food", paymentMethod: "Cash" },
      { title: "Electricity Bill", amount: 920, type: "expense", category: "Bills", paymentMethod: "GCash" },
      { title: "Commute", amount: 640, type: "expense", category: "Transportation", paymentMethod: "Cash" },
      { title: "School Project", amount: 780, type: "expense", category: "School", paymentMethod: "Debit Card" },
      { title: "Shopping", amount: 1500, type: "expense", category: "Shopping", paymentMethod: "Credit Card" },
      { title: "Movie Night", amount: 600, type: "expense", category: "Entertainment", paymentMethod: "GCash" },
      { title: "Restaurant", amount: 850, type: "expense", category: "Food", paymentMethod: "Credit Card" },
      { title: "Medicine", amount: 400, type: "expense", category: "Health", paymentMethod: "Cash" },
      { title: "Mobile Load", amount: 299, type: "expense", category: "Subscription", paymentMethod: "GCash" }
    ];

    return records.map((record, index) => ({
      ...record,
      amount: record.type === "income"
        ? record.amount
        : Math.round(record.amount * multiplier),
      date: buildDate(-monthsBack, 2 + index)
    }));
  }

  function buildBudgets(monthKeyValue) {
    return [
      { scope: "monthly", limit: 20000, month: monthKeyValue },
      { scope: "category", category: "Food", limit: 4000, month: monthKeyValue },
      { scope: "category", category: "Transportation", limit: 4000, month: monthKeyValue },
      { scope: "category", category: "Entertainment", limit: 2000, month: monthKeyValue },
      { scope: "category", category: "Bills", limit: 3000, month: monthKeyValue },
      { scope: "category", category: "Shopping", limit: 3000, month: monthKeyValue },
      { scope: "category", category: "Health", limit: 4000, month: monthKeyValue },
      { scope: "category", category: "School", limit: 2000, month: monthKeyValue }
    ].map(budget => ({
      ...budget,
      id: `bgt_${Utils.uid()}`
    }));
  }

  function buildRecurring() {
    const today = Utils.todayISO();
    return [
      {
        id: `rec_${Utils.uid()}`,
        name: "Internet Bill",
        amount: 1499,
        type: "expense",
        category: "Bills",
        frequency: "monthly",
        nextDue: Utils.addDays(today, 5),
        paymentMethod: "Bank Transfer",
        note: "Fiber broadband",
        paused: false
      },
      {
        id: `rec_${Utils.uid()}`,
        name: "Netflix Subscription",
        amount: 549,
        type: "expense",
        category: "Subscription",
        frequency: "monthly",
        nextDue: Utils.addDays(today, 9),
        paymentMethod: "Credit Card",
        note: "Standard plan",
        paused: false
      },
      {
        id: `rec_${Utils.uid()}`,
        name: "Apartment Rent",
        amount: 6500,
        type: "expense",
        category: "Bills",
        frequency: "monthly",
        nextDue: Utils.addDays(today, -2),
        paymentMethod: "Bank Transfer",
        note: "Monthly rent",
        paused: false
      },
      {
        id: `rec_${Utils.uid()}`,
        name: "Mobile Load",
        amount: 299,
        type: "expense",
        category: "Subscription",
        frequency: "monthly",
        nextDue: Utils.addDays(today, -1),
        paymentMethod: "GCash",
        note: "Data promos",
        paused: false
      },
      {
        id: `rec_${Utils.uid()}`,
        name: "School Allowance",
        amount: 5000,
        type: "income",
        category: "Allowance",
        frequency: "monthly",
        nextDue: Utils.addDays(today, 3),
        paymentMethod: "GCash",
        note: "From parents",
        paused: false
      },
      {
        id: `rec_${Utils.uid()}`,
        name: "Gym Membership",
        amount: 1000,
        type: "expense",
        category: "Health",
        frequency: "monthly",
        nextDue: Utils.addDays(today, 12),
        paymentMethod: "Debit Card",
        note: "Paused for now",
        paused: true
      }
    ];
  }

  function generate() {
    const now = new Date();
    const monthKeyValue = Utils.monthKey(now.getFullYear(), now.getMonth());

    // FACTORY is used for every generated transaction
    const rawTransactions = [
      ...currentMonthTransactions(),
      ...previousMonthTransactions(1, 1.00),
      ...previousMonthTransactions(2, 1.08),
      ...previousMonthTransactions(3, 0.94),
      ...previousMonthTransactions(4, 1.12),
      ...previousMonthTransactions(5, 0.98)
    ];

    const transactions = rawTransactions.map(record =>
      TransactionFactory.createTransaction({
        title: record.title,
        amount: record.amount,
        type: record.type,
        category: record.category,
        date: record.date,
        paymentMethod: record.paymentMethod,
        note: record.note || "",
        recurring: Boolean(record.recurring)
      })
    );

    return {
      transactions,
      budgets: buildBudgets(monthKeyValue),
      recurring: buildRecurring()
    };
  }

  return { generate };
})();
