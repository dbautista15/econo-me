const request = require('supertest');
const app = require('../../src/app'); // We'll need to modify our server setup for this

describe('API Tests', () => {
    test('GET /api/test should return success message', async () => {
        const response = await request(app)
            .get('/api/test')
            .expect(200);
        
        expect(response.body.message).toBe('Backend is running!');
    });
});