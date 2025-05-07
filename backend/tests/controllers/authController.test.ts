import { describe, it, before, after } from 'mocha';
import request from 'supertest';
import { expect } from 'chai';
import app from '../../src/app';
import { databaseManager } from '../../src/utils/db';

describe('Auth Controller Tests', () => {
  const testUser = {
    username: 'testuser',
    email: 'test@example.com',
    password: 'Password123!'
  };
  
  before(async () => {
    // Clean up any existing test user
    const pool = databaseManager.getPool();
    await pool.query('DELETE FROM users WHERE email = $1', [testUser.email]);
  });
  
  after(async () => {
    // Clean up test user
    const pool = databaseManager.getPool();
    await pool.query('DELETE FROM users WHERE email = $1', [testUser.email]);
  });
  
  // Happy Path Tests
  describe('POST /api/auth/register - Happy Path', () => {
    it('should register a new user successfully', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send(testUser);
      
      expect(res.status).to.equal(201);
      expect(res.body).to.have.property('message', 'User registered successfully');
      expect(res.body).to.have.property('token');
      expect(res.body).to.have.property('user');
      expect(res.body.user).to.have.property('username', testUser.username);
      expect(res.body.user).to.have.property('email', testUser.email);
    });
  });
  
  describe('POST /api/auth/login - Happy Path', () => {
    it('should login a registered user successfully', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password
        });
      
		expect(res.status).to.equal(200);
		expect(res.body).to.have.property('message', 'Login successful');
		expect(res.body).to.have.property('token');
		expect(res.body).to.have.property('user');
		expect(res.body.user).to.have.property('username', testUser.username);
		expect(res.body.user).to.have.property('email', testUser.email);
	  });
	});
	
	// Unhappy Path Tests
	describe('POST /api/auth/register - Unhappy Path', () => {
	  it('should return 400 when user already exists', async () => {
		const res = await request(app)
		  .post('/api/auth/register')
		  .send(testUser);
		
		expect(res.status).to.equal(400);
		expect(res.body).to.have.property('message', 'User with this email or username already exists');
	  });
	  
	  it('should return 400 when required fields are missing', async () => {
		const res = await request(app)
		  .post('/api/auth/register')
		  .send({
			email: 'incomplete@example.com'
			// Missing username and password
		  });
		
		expect(res.status).to.equal(400);
	  });
	});
	
	describe('POST /api/auth/login - Unhappy Path', () => {
	  it('should return 400 when email is incorrect', async () => {
		const res = await request(app)
		  .post('/api/auth/login')
		  .send({
			email: 'wrong@example.com',
			password: testUser.password
		  });
		
		expect(res.status).to.equal(400);
		expect(res.body).to.have.property('message', 'Invalid email or password');
	  });
	  
	  it('should return 400 when password is incorrect', async () => {
		const res = await request(app)
		  .post('/api/auth/login')
		  .send({
			email: testUser.email,
			password: 'WrongPassword123!'
		  });
		
		expect(res.status).to.equal(400);
		expect(res.body).to.have.property('message', 'Invalid email or password');
	  });
	  
	  it('should return 400 when required fields are missing', async () => {
		const res = await request(app)
		  .post('/api/auth/login')
		  .send({
			email: testUser.email
			// Missing password
		  });
		
		expect(res.status).to.equal(400);
	  });
	});
  });