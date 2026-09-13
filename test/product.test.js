const request = require('supertest');
const app = require('../app');
const pool = require('../config/db');

afterAll(async () => {
    await pool.end();
});

describe('Product Endpoints', () => {
    let token;
    let categoryId;
    const testUser = {
        name: 'Product Tester',
        email: `produser${Date.now()}@test.com`,
        password: 'password123'
    };

    beforeAll(async () => {
        await request(app).post('/api/users/register').send(testUser);
        const loginRes = await request(app).post('/api/users/login').send({ email: testUser.email, password: testUser.password });
        token = loginRes.body.data.token;

        const catRes = await request(app)
            .post('/api/categories')
            .set('Authorization', `Bearer ${token}`)
            .send({ name: `ProductTestCategory${Date.now()}` });
        categoryId = catRes.body.data.id;
    });

    it('should reject product creation without a token', async () => {
        const res = await request(app).post('/api/products').send({ name: 'NoAuthProduct', price: 10, stock: 5, category_id: categoryId });
        expect(res.statusCode).toBe(401);
    });

    it('should reject product creation with price <= 0', async () => {
        const res = await request(app)
            .post('/api/products')
            .set('Authorization', `Bearer ${token}`)
            .send({ name: 'FreeProduct', price: 0, stock: 5, category_id: categoryId });
        expect(res.statusCode).toBe(400);
    });

    it('should reject product creation with negative stock', async () => {
        const res = await request(app)
            .post('/api/products')
            .set('Authorization', `Bearer ${token}`)
            .send({ name: 'BadStock', price: 10, stock: -5, category_id: categoryId });
        expect(res.statusCode).toBe(400);
    });

    it('should reject product creation with invalid category_id', async () => {
        const res = await request(app)
            .post('/api/products')
            .set('Authorization', `Bearer ${token}`)
            .send({ name: 'OrphanProduct', price: 10, stock: 5, category_id: 999999 });
        expect(res.statusCode).toBe(400);
    });

    it('should create a product successfully', async () => {
        const res = await request(app)
            .post('/api/products')
            .set('Authorization', `Bearer ${token}`)
            .send({ name: 'Test Product', price: 19.99, stock: 25, category_id: categoryId });
        expect(res.statusCode).toBe(201);
        expect(res.body.success).toBe(true);
    });

    it('should get all products with pagination', async () => {
        const res = await request(app).get('/api/products?page=1&limit=5');
        expect(res.statusCode).toBe(200);
        expect(res.body.pagination).toBeDefined();
    });

    it('should return 404 for a non-existent product', async () => {
        const res = await request(app).get('/api/products/999999');
        expect(res.statusCode).toBe(404);
    });

    it('should reject product deletion without a token', async () => {
        const res = await request(app).delete('/api/products/1');
        expect(res.statusCode).toBe(401);
    });
});