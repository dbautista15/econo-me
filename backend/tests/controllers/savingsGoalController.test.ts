import { describe, it, before, afterEach, beforeEach } from 'mocha';
import request from 'supertest';
import { expect } from 'chai';
import app from '../../src/app';
import { generateTestToken, clearUserData, createTestSavingsGoal } from '../helpers';

describe('Savings Controller Tests', () => {
  let authToken: string;
  const testUserId = 1;
  
  before(async () => {
    authToken = generateTestToken(testUserId);
  });
  
  afterEach(async () => {
    await clearUserData(testUserId);
  });
  
  // Happy Path Tests
  describe('GET /api/savings-goals - Happy Path', () => {
    beforeEach(async () => {
      await createTestSavingsGoal(testUserId, 'Vacation', 5000);
      await createTestSavingsGoal(testUserId, 'New Car', 10000);
    });
    
    it('should return user savings goals when authenticated', async () => {
      const res = await request(app)
        .get('/api/savings-goals')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(res.status).to.equal(200);
      expect(res.body).to.be.an('array');
      expect(res.body.length).to.equal(2);
      
      const names = res.body.map((goal: any) => goal.name);
      expect(names).to.include('Vacation');
      expect(names).to.include('New Car');
    });
  });
  
  describe('POST /api/savings-goals - Happy Path', () => {
    it('should create a new savings goal successfully', async () => {
      const res = await request(app)
        .post('/api/savings-goals')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Home Deposit',
          target_amount: 20000,
          current_amount: 5000,
          target_date: new Date().toISOString()
        });
      
      expect(res.status).to.equal(201);
      expect(res.body).to.have.property('savingsGoal');
      expect(res.body.savingsGoal).to.have.property('name', 'Home Deposit');
      expect(res.body.savingsGoal).to.have.property('target_amount', 20000);
      expect(res.body.savingsGoal).to.have.property('current_amount', 5000);
    });
  });
  
  describe('PUT /api/savings-goals/:id - Happy Path', () => {
    let goalId: number;
    
    beforeEach(async () => {
      const goal = await createTestSavingsGoal(testUserId, 'Vacation', 5000);
      goalId = goal.id;
    });
    
    it('should update an existing savings goal successfully', async () => {
      const res = await request(app)
        .put(`/api/savings-goals/${goalId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Vacation',
          target_amount: 6000,
          current_amount: 1000,
          target_date: new Date().toISOString()
        });
      
      expect(res.status).to.equal(200);
      expect(res.body).to.have.property('message', 'Savings goal updated successfully');
      expect(res.body.savingsGoal).to.have.property('target_amount', 6000);
    });
  });
  
  describe('DELETE /api/savings-goals/:id - Happy Path', () => {
    let goalId: number;
    
    beforeEach(async () => {
      const goal = await createTestSavingsGoal(testUserId, 'Vacation', 5000);
      goalId = goal.id;
    });
    
    it('should delete an existing savings goal successfully', async () => {
      const res = await request(app)
        .delete(`/api/savings-goals/${goalId}`)
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(res.status).to.equal(200);
      expect(res.body).to.have.property('message', 'Savings goal deleted successfully');
    });
  });
  
  // Unhappy Path Tests
  describe('GET /api/savings-goals - Unhappy Path', () => {
    it('should return 401 when not authenticated', async () => {
      const res = await request(app)
        .get('/api/savings-goals');
      
      expect(res.status).to.equal(401);
    });
  });
  
  describe('POST /api/savings-goals - Unhappy Path', () => {
    it('should return 401 when not authenticated', async () => {
      const res = await request(app)
        .post('/api/savings-goals')
        .send({
          name: 'Home Deposit',
          target_amount: 20000
        });
      
      expect(res.status).to.equal(401);
    });
  });
  
  describe('PUT /api/savings-goals/:id - Unhappy Path', () => {
    it('should return 404 when savings goal does not exist', async () => {
      const res = await request(app)
        .put('/api/savings-goals/99999')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Vacation',
          target_amount: 6000
        });
      
      expect(res.status).to.equal(404);
      expect(res.body).to.have.property('message', 'Savings goal not found or unauthorized');
    });
    
    it('should return 400 when target amount is missing', async () => {
      const goal = await createTestSavingsGoal(testUserId, 'Vacation', 5000);
      
      const res = await request(app)
        .put(`/api/savings-goals/${goal.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Vacation',
          current_amount: 1000
        });
      
      expect(res.status).to.equal(400);
      expect(res.body).to.have.property('error', 'Target amount is required');
    });
  });
  
  describe('DELETE /api/savings-goals/:id - Unhappy Path', () => {
    it('should return 404 when savings goal does not exist', async () => {
      const res = await request(app)
        .delete('/api/savings-goals/99999')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(res.status).to.equal(404);
      expect(res.body).to.have.property('message', 'Savings goal not found or unauthorized');
    });
  });
});