import { describe, it, before, afterEach, beforeEach } from 'mocha';
import request from 'supertest';
import { expect } from 'chai';
import app from '../../src/app';
import { generateTestToken, clearUserData, createTestIncome } from '../helpers';

describe('Income Controller Tests', () => {
  let authToken: string;
  const testUserId = 1;
  
  before(async () => {
    authToken = generateTestToken(testUserId);
  });
  
  afterEach(async () => {
    await clearUserData(testUserId);
  });
  
  // Happy Path Tests
  describe('GET /api/incomes - Happy Path', () => {
    beforeEach(async () => {
      await createTestIncome(testUserId, 'Salary', 5000);
      await createTestIncome(testUserId, 'Freelance', 1000);
    });
    
    it('should return user incomes when authenticated', async () => {
      const res = await request(app)
        .get('/api/incomes')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(res.status).to.equal(200);
      expect(res.body).to.be.an('array');
      expect(res.body.length).to.equal(2);
      
      const sources = res.body.map((income: any) => income.source);
      expect(sources).to.include('Salary');
      expect(sources).to.include('Freelance');
    });
  });
  
  describe('POST /api/incomes - Happy Path', () => {
    it('should create a new income successfully', async () => {
      const res = await request(app)
        .post('/api/incomes')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          source: 'Bonus',
          amount: 2000,
          income_date: new Date().toISOString()
        });
      
      expect(res.status).to.equal(201);
      expect(res.body).to.have.property('income');
      expect(res.body.income).to.have.property('source', 'Bonus');
      expect(res.body.income).to.have.property('amount', 2000);
    });
  });
  
  describe('PUT /api/incomes/:id - Happy Path', () => {
    let incomeId: number;
    
    beforeEach(async () => {
      const income = await createTestIncome(testUserId, 'Salary', 5000);
      incomeId = income.id;
    });
    
    it('should update an existing income successfully', async () => {
      const res = await request(app)
        .put(`/api/incomes/${incomeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          source: 'Salary',
          amount: 5500,
          income_date: new Date().toISOString()
        });
      
      expect(res.status).to.equal(200);
      expect(res.body).to.have.property('message', 'Income updated successfully');
      expect(res.body.income).to.have.property('amount', 5500);
    });
  });
  
  describe('DELETE /api/incomes/:id - Happy Path', () => {
    let incomeId: number;
    
    beforeEach(async () => {
      const income = await createTestIncome(testUserId, 'Salary', 5000);
      incomeId = income.id;
    });
    
    it('should delete an existing income successfully', async () => {
      const res = await request(app)
        .delete(`/api/incomes/${incomeId}`)
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(res.status).to.equal(200);
      expect(res.body).to.have.property('message', 'Income deleted successfully');
    });
  });
  
  // Unhappy Path Tests
  describe('GET /api/incomes - Unhappy Path', () => {
    it('should return 401 when not authenticated', async () => {
      const res = await request(app)
        .get('/api/incomes');
      
      expect(res.status).to.equal(401);
    });
  });
  
  describe('POST /api/incomes - Unhappy Path', () => {
    it('should return 401 when not authenticated', async () => {
      const res = await request(app)
        .post('/api/incomes')
        .send({
          source: 'Bonus',
          amount: 2000
        });
      
      expect(res.status).to.equal(401);
    });
  });
  
  describe('PUT /api/incomes/:id - Unhappy Path', () => {
    it('should return 404 when income does not exist', async () => {
      const res = await request(app)
        .put('/api/incomes/99999')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          source: 'Salary',
          amount: 5500,
          income_date: new Date().toISOString()
        });
      
      expect(res.status).to.equal(404);
      expect(res.body).to.have.property('message', 'Income not found or unauthorized');
    });
  });
  
  describe('DELETE /api/incomes/:id - Unhappy Path', () => {
    it('should return 404 when income does not exist', async () => {
      const res = await request(app)
        .delete('/api/incomes/99999')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(res.status).to.equal(404);
      expect(res.body).to.have.property('message', 'Income not found or unauthorized');
    });
  });
});