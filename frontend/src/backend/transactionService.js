exports.handleTransaction = async ({ from, to, amount }) => {
  // Simulate a transaction
  if (!from || !to || amount <= 0) return { success: false };
  return { success: true };
};
