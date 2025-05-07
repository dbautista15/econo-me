import { describe, it, before, after } from 'mocha';
import request from 'supertest';
import { expect } from 'chai';
import app from '../../src/app';
import { generateTestToken, clearUserData } from '../helpers';

describe('API Integration Tests', () => {
  let authToken: string;
  const testUserId = 1;
  
  before(async () => {
    authToken = generateTestToken(testUserId);
    await clearUserData(testUserId);
  });
  
  after(async () => {
    await clearUserData(testUserId);
  });
  
  it('should verify database connection', async () => {
    const res = await request(app)
      .get('/api/db-check');
    
    expect(res.status).to.equal(200);
    expect(res.body).to.have.property('status', 'Database connection successful');
  });
  
  describe('Complete Budget Workflow', () => {
    it('should create, retrieve, update, and delete a budget', async () => {
      // 1. Create a budget
      const createRes = await request(app)
        .post('/api/budgets')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          category: 'Entertainment',
          limit: 200
        });
      
      expect(createRes.status).to.equal(201);
      const budgetId = createRes.body.budget.id;
      
      // 2. Get all budgets
      const getRes = await request(app)
        .get('/api/budgets')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(getRes.status).to.equal(200);
      expect(getRes.body).to.be.an('array');
      expect(getRes.body.length).to.equal(1);
      
      // 3. Update the budget
      const updateRes = await request(app)
        .put(`/api/budgets/${budgetId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          limit: 250
        });
      
      expect(updateRes.status).to.equal(200);
      expect(updateRes.body.budget.limit_amount).to.equal(250);
      
      // 4. Delete the budget
      const deleteRes = await request(app)
        .delete(`/api/budgets/${budgetId}`)
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(deleteRes.status).to.equal(200);
      
      // 5. Verify deletion
      const verifyRes = await request(app)
        .get('/api/budgets')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(verifyRes.body).to.be.an('array');
      expect(verifyRes.body.length).to.equal(0);
    });
  });
  
  describe('Complete Finance Workflow', () => {
    it('should track income, expenses, and savings goals with calculated totals', async () => {
      // 1. Add income
      const incomeRes = await request(app)
        .post('/api/incomes')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          source: 'Salary',
          amount: 3000,
          income_date: new Date().toISOString()
        });
      
      expect(incomeRes.status).to.equal(201);
      
      // 2. Add expenses
      const expense1Res = await request(app)
        .post('/api/expenses')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          category: 'Housing',
          amount: 1000,
          date: new Date().toISOString()
        });
      
      expect(expense1Res.status).to.equal(201);
      
      const expense2Res = await request(app)
        .post('/api/expenses')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          category: 'Food',
          amount: 500,
          date: new Date().toISOString()
        });
      
      expect(expense2Res.status).to.equal(201);
      
      // 3. Create a savings goal
      const savingsRes = await request(app)
        .post('/api/savings-goals')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Vacation',
          target_amount: 1000,
          current_amount: 0,
          target_date: new Date().toISOString()
        });
      
      expect(savingsRes.status).to.equal(201);
      
      // 4. Create budgets for categories
      const budget1Res = await request(app)
        .post('/api/budgets')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          category: 'Housing',
          limit: 1200
        });
      
      expect(budget1Res.status).to.equal(201);
      
      const budget2Res = await request(app)
        .post('/api/budgets')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          category: 'Food',
          limit: 600
        });
      
      expect(budget2Res.status).to.equal(201);
      
      // 5. Get all expenses
      const expensesRes = await request(app)
        .get('/api/expenses')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(expensesRes.status).to.equal(200);
      expect(expensesRes.body).to.be.an('array');
      expect(expensesRes.body.length).to.equal(2);
      
      // 6. Get all incomes
      const incomesRes = await request(app)
        .get('/api/incomes')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(incomesRes.status).to.equal(200);
      expect(incomesRes.body).to.be.an('array');
      expect(incomesRes.body.length).to.equal(1);
      
      // 7. Get all budgets
      const budgetsRes = await request(app)
        .get('/api/budgets')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(budgetsRes.status).to.equal(200);
      expect(budgetsRes.body).to.be.an('array');
      expect(budgetsRes.body.length).to.equal(2);
      
      // 8. Get all savings goals
      const savingsGoalsRes = await request(app)
        .get('/api/savings-goals')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(savingsGoalsRes.status).to.equal(200);
      expect(savingsGoalsRes.body).to.be.an('array');
      expect(savingsGoalsRes.body.length).to.equal(1);
      
      // 9. Verify totals
      const totalIncome = incomesRes.body.reduce((sum: number, income: any) => sum + parseFloat(income.amount), 0);
      const totalExpenses = expensesRes.body.reduce((sum: number, expense: any) => sum + parseFloat(expense.amount), 0);
      const savingsAmount = totalIncome - totalExpenses;
      
      expect(totalIncome).to.equal(3000);
      expect(totalExpenses).to.equal(1500);
      expect(savingsAmount).to.equal(1500);
    });
  });
});