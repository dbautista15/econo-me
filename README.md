# econo-me
A personal finance tracking application

# econo-me API

A RESTful API for managing personal finances and budgeting. This application allows users to track income, expenses, and monitor their financial habits.

## Features

- User Authentication
- Income and Expense Tracking
- Budget Management
- Financial Summaries and Analytics
- Category-based Transaction Organization

## Tech Stack

- Node.js/Express
- PostgreSQL
- Jest (Testing)
- JWT Authentication

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL
- npm or yarn

## Installation

1. Clone the repository:
bash
git clone [your-repository-url]
cd econo-me
cd backend 
npm install
create a new .env file in the backend directory
PORT=5001
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/econo-me
JWT_SECRET=your_jwt_secret 
create database and run migrations: [ Database setup instructions will be added]
## API Endpoints
Authentication

POST /api/auth/register - Register a new user
POST /api/auth/login - Login user

Transactions

GET /api/transactions - Get all transactions
POST /api/transactions - Create new transaction
PUT /api/transactions/:id - Update transaction
DELETE /api/transactions/:id - Delete transaction

Budgets

GET /api/budgets - Get all budgets
POST /api/budgets - Create new budget
PUT /api/budgets/:id - Update budget
DELETE /api/budgets/:id - Delete budget

## Tests 
You can run tests using npm test

## Project Structure
budget-tracker/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── middleware/
│   │   ├── utils/
│   │   └── app.js
│   ├── tests/
│   │   ├── integration/
│   │   └── unit/
│   └── package.json
└── README.md
## Crash course on Github and working together
this is a guide on how to SAFELY push your changes to github so no one accidentally messes up the repo lol
- first check what files have been changed:
git status
- add all your changes to staging ( or you can add specefic files):
git add . # adds all files
#or 
git add specific_file.js # adds just one file
- commit your changes with a descriptive message: 
git commit -m "blah blah blah"
- before PUSHING its good to get in the habit to pull any changes our team did
git push origin main 
 REMEMBER :
 - always pull before pushing to avoid conflicts
 - write clear commmit messages that explain what you changed 
 - if working on a new feature, MAKE A BRANCH we will merge them later after we all talk about it.
 - communicate with everybody about what your working on. 

