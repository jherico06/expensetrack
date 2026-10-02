/* ============================================================
   transactionFactory.js
   FACTORY DESIGN PATTERN
   ------------------------------------------------------------
   TransactionFactory is the single place where every new
   transaction object is created. It guarantees that each
   transaction always has a complete, consistent structure
   (id, title, amount, type, category, date, paymentMethod,
   note, recurring, createdAt) no matter where it comes from —
   the add form, the duplicate action or a recurring item.
   ============================================================ */

const TransactionFactory = {

  /**
   * Creates a normalized transaction object.
   * @param {Object} data – raw transaction data
   * @returns {Object} a complete transaction object
   */
  createTransaction(data) {
    return {
      id: (window.crypto && crypto.randomUUID)
        ? crypto.randomUUID()
        : `tx_${Date.now()}_${Math.random().toString(16).slice(2)}`,

      title: String(data.title || "").trim(),
      amount: Number(data.amount) || 0,
      type: data.type === "income" ? "income" : "expense",
      category: data.category || "Other",
      date: data.date || Utils.todayISO(),
      paymentMethod: data.paymentMethod || "Cash",
      note: data.note || "",
      recurring: Boolean(data.recurring),
      createdAt: new Date().toISOString()
    };
  },

  /**
   * Duplicates an existing transaction through the factory
   * so the copy always gets a fresh id and createdAt stamp.
   */
  duplicateTransaction(transaction) {
    return this.createTransaction({
      title: transaction.title,
      amount: transaction.amount,
      type: transaction.type,
      category: transaction.category,
      date: transaction.date,
      paymentMethod: transaction.paymentMethod,
      note: transaction.note,
      recurring: transaction.recurring
    });
  }
};
