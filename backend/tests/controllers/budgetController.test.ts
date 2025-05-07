import { describe, it, before, after, beforeEach, afterEach } from 'mocha';
import request from 'supertest';
import { expect } from 'chai';
import app from '../../src/app';
import { databaseManager } from '../../src/utils/db';
import { generateTestToken, clearUserData, createTestBudget } from '../helpers';

describe('Budget Controller Tests', () => {
  let authToken: string;
  const testUserId = 1;
  
  before(async () => {
    authToken = generateTestToken(testUserId);
  });
  
  // Important: Clear data BEFORE each test, not just after
  beforeEach(async () => {
    await clearUserData(testUserId);
  });
  
  afterEach(async () => {
    await clearUserData(testUserId);
  });
  
  // Happy Path Tests
  describe('GET /api/budgets - Happy Path', () => {
    beforeEach(async () => {
      // Create test data
      await createTestBudget(testUserId, 'Food', 300);
      await createTestBudget(testUserId, 'Transportation', 150);
    });
    
    it('should return user budgets when authenticated', async () => {
      const res = await request(app)
        .get('/api/budgets')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(res.status).to.equal(200);
      expect(res.body).to.be.an('array');
      expect(res.body.length).to.equal(2);
      
      const categories = res.body.map((budget: any) => budget.category);
      expect(categories).to.include('Food');
      expect(categories).to.include('Transportation');
    });
  });
  
  describe('POST /api/budgets - Happy Path', () => {
    it('should create a new budget successfully', async () => {
      const res = await request(app)
        .post('/api/budgets')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          category: 'Entertainment',
          limit: 200
        });
      
      expect(res.status).to.equal(201);
      expect(res.body).to.have.property('message', 'Budget created successfully');
      expect(res.body).to.have.property('budget');
      expect(res.body.budget).to.have.property('category', 'Entertainment');
      expect(res.body.budget).to.have.property('limit_amount', 200);
    });
  });
  
  describe('PUT /api/budgets/:id - Happy Path', () => {
    let budgetId: number;
    
    beforeEach(async () => {
      // Make sure to create a unique category name for this test
      const budget = await createTestBudget(testUserId, 'Housing', 500);
      budgetId = budget.id;
    });
    
    it('should update an existing budget successfully', async () => {
      const res = await request(app)
        .put(`/api/budgets/${budgetId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          limit: 600
        });
      
      expect(res.status).to.equal(200);
      expect(res.body).to.have.property('message', 'Budget updated successfully');
      expect(res.body.budget).to.have.property('limit_amount', 600);
    });
  });
  
  describe('DELETE /api/budgets/:id - Happy Path', () => {
    let budgetId: number;
    
    beforeEach(async () => {
      // Make sure to create a unique category name for this test
      const budget = await createTestBudget(testUserId, 'Shopping', 300);
      budgetId = budget.id;
    });
    
    it('should delete an existing budget successfully', async () => {
      const res = await request(app)
        .delete(`/api/budgets/${budgetId}`)
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(res.status).to.equal(200);
      expect(res.body).to.have.property('message', 'Budget deleted successfully');
      expect(res.body.budget).to.have.property('id', budgetId);
      
      // Verify it's deleted
      const checkBudgets = await request(app)
        .get('/api/budgets')
        .set('Authorization', `Bearer ${authToken}`);
        
      expect(checkBudgets.body.length).to.equal(0);
    });
  });
  
  // Unhappy Path Tests
  describe('GET /api/budgets - Unhappy Path', () => {
    it('should return 401 when not authenticated', async () => {
      const res = await request(app)
        .get('/api/budgets');
      
      expect(res.status).to.equal(401);
    });
  });
  
  describe('POST /api/budgets - Unhappy Path', () => {
    it('should return 400 when category already exists', async () => {
      // First create a budget - use a different category name from other tests
      await createTestBudget(testUserId, 'Entertainment2', 150);
      
      // Try to create the same category again
      const res = await request(app)
        .post('/api/budgets')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          category: 'Entertainment2',
          limit: 200
        });
      
      expect(res.status).to.equal(400);
      expect(res.body).to.have.property('message', 'A budget for this category already exists');
    });
    
    it('should return 401 when not authenticated', async () => {
      const res = await request(app)
        .post('/api/budgets')
        .send({
          category: 'Entertainment3',
          limit: 200
        });
      
      expect(res.status).to.equal(401);
    });
  });
  
  describe('PUT /api/budgets/:id - Unhappy Path', () => {
    let budgetId: number;
    
    beforeEach(async () => {
      // Use a different category name to avoid conflicts
      const budget = await createTestBudget(testUserId, 'Housing2', 500);
      budgetId = budget.id;
    });
    
    it('should return 400 when limit is missing', async () => {
      const res = await request(app)
        .put(`/api/budgets/${budgetId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          category: 'Updated Housing'
        });
      
      expect(res.status).to.equal(400);
      expect(res.body).to.have.property('error', 'Budget limit is required');
    });
    
    it('should return 404 when budget does not exist', async () => {
      const res = await request(app)
        .put('/api/budgets/99999')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          limit: 600
        });
      
      expect(res.status).to.equal(404);
      expect(res.body).to.have.property('message', 'Budget not found or unauthorized');
    });
  });
  
  describe('DELETE /api/budgets/:id - Unhappy Path', () => {
    it('should return 404 when budget does not exist', async () => {
      const res = await request(app)
        .delete('/api/budgets/99999')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(res.status).to.equal(404);
      expect(res.body).to.have.property('message', 'Budget not found or unauthorized');
    });
  });
});