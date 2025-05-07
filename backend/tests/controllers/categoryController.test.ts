import { describe, it } from 'mocha';
import request from 'supertest';
import { expect } from 'chai';
import app from '../../src/app';
import { ExpenseCategory } from '../../src/types';

describe('Category Controller Tests', () => {
  // Happy Path Tests
  describe('GET /api/categories - Happy Path', () => {
    it('should return categories successfully', async () => {
      const res = await request(app)
        .get('/api/categories');
      
      expect(res.status).to.equal(200);
      expect(res.body).to.be.an('array');
      
      // Check that default categories are included
      const defaultCategories = Object.values(ExpenseCategory);
      for (const category of defaultCategories) {
        expect(res.body).to.include(category);
      }
    });
  });
  
  // Note: There's no authentication requirement for categories endpoint,
  // and there are no obvious unhappy paths since it returns defaults even on error
});