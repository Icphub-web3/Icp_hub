const request = require('supertest');
const app = require('../../src/backend/app');

describe('API Auth', () => {
  it('should validate wallet address', async () => {
    const res = await request(app).post('/api/auth').send({ address: '0x123' });
    expect(res.statusCode).toBe(200);
  });
});
