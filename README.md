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

# for the frontend 
# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)

hosting website URL: https://econo-me-frontend.onrender.com/
