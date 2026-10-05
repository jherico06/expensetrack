/* ============================================================
   data/sampleData.js
   Raw dataset provider for ExpenseFlow.
   Returns empty raw sets so the user begins with a clean slate
   ready to add their own custom transactions and budgets.
   ============================================================ */

const SampleData = (() => {
  function generate() {
    return {
      transactions: [],
      budgets: [],
      recurring: []
    };
  }

  return { generate };
})();
