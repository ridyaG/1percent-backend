const request = require('supertest');
const app = require('../../src/app');
const prisma = require('../../src/config/database');

async function cleanupTestUsers() {
  await prisma.refreshToken.deleteMany({
    where: {
      user: {
        OR: [
          { email: 'test@example.com' },
          { username: { in: ['testuser', 'other'] } }
        ]
      }
    }
  });
  await prisma.user.deleteMany({
    where: {
      OR: [
        { email: 'test@example.com' },
        { username: { in: ['testuser', 'other'] } }
      ]
    }
  });
}

beforeAll(async () => {
  await cleanupTestUsers();
});

afterAll(async () => {
  await cleanupTestUsers();
  await prisma.$disconnect();
});

describe('POST /api/v1/auth/register', () => {
  test('creates user and returns tokens', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        username: 'testuser',
        email: 'test@example.com',
        password: 'Password123',
        displayName: 'Test User',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.accessToken).toBeDefined();
    expect(res.body.data.refreshToken).toBeDefined();
  });

  test('rejects duplicate email', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ username: 'other', email: 'test@example.com', password: 'Test1234', displayName: 'Other' });

    expect(res.status).toBe(409);
  });
});