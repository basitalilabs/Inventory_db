const request = require('supertest');
const app = require('../app');
const pool = require('../config/db');

afterAll(async () => {
    await pool.end();
});

describe('Auth Endpoints', () => {
    const testUser = {
        name: 'Test User',
        email: `testuser${Date.now()}@test.com`, // unique email each run
        password: 'password123'
    };

    it('should reject registration with missing fields', async () => {
        const res = await request(app).post('/api/users/register').send({ email: 'test@test.com' });
        expect(res.statusCode).toBe(400);
        expect(res.body.success).toBe(false);
    });

    it('should reject registration with invalid email', async () => {
        const res = await request(app).post('/api/users/register').send({ name: 'Test', email: 'bad-email', password: 'password123' });
        expect(res.statusCode).toBe(400);
    });

    it('should reject registration with short password', async () => {
        const res = await request(app).post('/api/users/register').send({ name: 'Test', email: 'test2@test.com', password: '123' });
        expect(res.statusCode).toBe(400);
    });

    it('should register a new user successfully', async () => {
        const res = await request(app).post('/api/users/register').send(testUser);
        expect(res.statusCode).toBe(201);
        expect(res.body.success).toBe(true);
        expect(res.body.data.email).toBe(testUser.email);
    });

    it('should reject duplicate registration', async () => {
        const res = await request(app).post('/api/users/register').send(testUser);
        expect(res.statusCode).toBe(400);
    });

    it('should reject login with wrong password', async () => {
        const res = await request(app).post('/api/users/login').send({ email: testUser.email, password: 'wrongpassword' });
        expect(res.statusCode).toBe(400);
    });

    it('should login successfully with correct credentials', async () => {
        const res = await request(app).post('/api/users/login').send({ email: testUser.email, password: testUser.password });
        expect(res.statusCode).toBe(200);
        expect(res.body.data.token).toBeDefined();
    });
});