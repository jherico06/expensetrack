/* ============================================================
   strategies.js
   STRATEGY DESIGN PATTERN
   ------------------------------------------------------------
   Each sorting rule is encapsulated in its own strategy
   function. The context function applySortStrategy() picks a
   strategy by name at runtime, so the calling code never has
   to change when a new sorting option is added.

   Swap strategies simply by calling:
     applySortStrategy("highest", transactions)
   ============================================================ */

const SortStrategies = {

  newest: transactions =>
    [...transactions].sort((a, b) => Utils.compareDates(b.date, a.date)),

  oldest: transactions =>
    [...transactions].sort((a, b) => Utils.compareDates(a.date, b.date)),

  highest: transactions =>
    [...transactions].sort((a, b) => b.amount - a.amount),

  lowest: transactions =>
    [...transactions].sort((a, b) => a.amount - b.amount),

  az: transactions =>
    [...transactions].sort((a, b) => a.title.localeCompare(b.title)),

  za: transactions =>
    [...transactions].sort((a, b) => b.title.localeCompare(a.title))
};

/**
 * Context of the Strategy pattern.
 * @param {string} strategyName – key inside SortStrategies
 * @param {Array} transactions   – list to sort (not mutated)
 * @returns {Array} a new sorted array
 */
function applySortStrategy(strategyName, transactions) {
  const strategy = SortStrategies[strategyName];
  return typeof strategy === "function"
    ? strategy(transactions)
    : [...transactions];
}
