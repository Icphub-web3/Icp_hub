const { handleTransaction } = require('../../src/backend/transactionService');

describe('Transaction Service', () => {
  it('should handle payment', async () => {
    const result = await handleTransaction({ from: '0x1', to: '0x2', amount: 1 });
    expect(result.success).toBe(true);
  });
});
