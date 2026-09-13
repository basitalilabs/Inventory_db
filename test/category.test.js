const request = require('supertest');
const app = require('../app');
const pool = require('../config/db');

afterAll(async () => {
    await pool.end();
});

describe('Category Endpoints', () => {
    let token;
    const testUser = {
        name: 'Category Tester',
        email: `catuser${Date.now()}@test.com`,
        password: 'password123'
    };
    const testCategoryName = `TestCategory${Date.now()}`;

    beforeAll(async () => {
        await request(app).post('/api/users/register').send(testUser);
        const loginRes = await request(app).post('/api/users/login').send({ email: testUser.email, password: testUser.password });
        token = loginRes.body.data.token;
    });

    it('should reject category creation without a token', async () => {
        const res = await request(app).post('/api/categories').send({ name: 'NoAuthCategory' });
        expect(res.statusCode).toBe(401);
    });

    it('should reject category creation with missing name', async () => {
        const res = await request(app).post('/api/categories').set('Authorization', `Bearer ${token}`).send({});
        expect(res.statusCode).toBe(400);
    });

    it('should create a category successfully', async () => {
        const res = await request(app).post('/api/categories').set('Authorization', `Bearer ${token}`).send({ name: testCategoryName });
        expect(res.statusCode).toBe(201);
        expect(res.body.success).toBe(true);
    });

    it('should reject duplicate category name', async () => {
        const res = await request(app).post('/api/categories').set('Authorization', `Bearer ${token}`).send({ name: testCategoryName });
        expect(res.statusCode).toBe(400);
    });

    it('should get all categories', async () => {
        const res = await request(app).get('/api/categories');
        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('should return 404 for a non-existent category', async () => {
        const res = await request(app).get('/api/categories/999999');
        expect(res.statusCode).toBe(404);
    });
});