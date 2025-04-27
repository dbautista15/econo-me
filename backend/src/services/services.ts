/**
 * Finance management system module
 */

// Types
export interface Expense {
	id?: number;
	category: string;
	amount: number;
	date?: Date;
  }
  
  export interface SavingsStatus {
	isReached: boolean;
	statusText: string;
	remainingAmount: number;
  }
  
  export enum ExpenseCategory {
	Food = 'Food',
	Transportation = 'Transportation',
	Housing = 'Housing',
	Utilities = 'Utilities',
	Entertainment = 'Entertainment',
	Healthcare = 'Healthcare',
	DiningOut = 'Dining Out',
	Shopping = 'Shopping'
  }
  
  // Expense management
  export class ExpenseManager {
	private expenses: Expense[] = [];
	
	constructor(initialExpenses: Expense[] = []) {
	  this.expenses = initialExpenses;
	}
	
	addExpense(expense: Expense): void {
	  this.expenses.push(expense);
	}
	
	getExpenses(): Expense[] {
	  return [...this.expenses];
	}
	
	getTotalExpenses(): number {
	  return this.expenses.reduce((total, expense) => total + expense.amount, 0);
	}
	
	getCategoryTotal(category: string): number {
	  return this.expenses
		.filter(expense => expense.category === category)
		.reduce((total, expense) => total + expense.amount, 0);
	}
	
	getExpensesByCategory(): Record<string, number> {
	  const categoryTotals: Record<string, number> = {};
	  
	  this.expenses.forEach(expense => {
		if (!categoryTotals[expense.category]) {
		  categoryTotals[expense.category] = 0;
		}
		categoryTotals[expense.category] += expense.amount;
	  });
	  
	  return categoryTotals;
	}
	
	getUniqueCategories(): string[] {
	  return [...new Set(this.expenses.map(expense => expense.category))];
	}
  }
  
  // Budget management
  export class BudgetManager {
	private spendingLimit: number = 0;
	
	constructor(initialLimit: number = 0) {
	  this.spendingLimit = initialLimit;
	}
	
	setSpendingLimit(limit: number): void {
	  if (limit < 0) {
		throw new Error("Spending limit cannot be negative");
	  }
	  this.spendingLimit = limit;
	}
	
	getSpendingLimit(): number {
	  return this.spendingLimit;
	}
	
	isOverBudget(totalExpenses: number): boolean {
	  return totalExpenses > this.spendingLimit;
	}
	
	generateSuggestion(totalExpenses: number): string {
	  return this.isOverBudget(totalExpenses) 
		? 'Consider reducing spending on non-essential items.'
		: 'Great job on managing expenses!';
	}
  }
  
  // Savings management
  export class SavingsManager {
	private savingGoal: number = 0;
	
	constructor(initialGoal: number = 0) {
	  this.savingGoal = initialGoal;
	}
	
	setSavingGoal(goal: number): void {
	  if (goal < 0) {
		throw new Error("Saving goal cannot be negative");
	  }
	  this.savingGoal = goal;
	}
	
	getSavingGoal(): number {
	  return this.savingGoal;
	}
	
	getSavingsStatus(income: number, expenses: number): SavingsStatus {
	  const currentSavings = income - expenses;
	  const isReached = currentSavings >= this.savingGoal;
	  const remainingAmount = isReached ? 0 : this.savingGoal - currentSavings;
	  
	  return {
		isReached,
		statusText: isReached ? 'Reached' : 'Not Reached',
		remainingAmount
	  };
	}
	
	generateSavingsSuggestion(income: number, expenses: number): string {
	  const { isReached, remainingAmount } = this.getSavingsStatus(income, expenses);
	  
	  return isReached
		? 'Congratulations! You have reached your savings goal. Consider allocating surplus funds wisely.'
		: `You are $${Math.abs(remainingAmount)} away from your savings goal. Keep track of your spending to reach your goal!`;
	}
  }
  
  // Main Econome class
  export class Econome {
	private income: number = 0;
	private expenseManager: ExpenseManager;
	private budgetManager: BudgetManager;
	private savingsManager: SavingsManager;
	
	constructor() {
	  this.expenseManager = new ExpenseManager();
	  this.budgetManager = new BudgetManager();
	  this.savingsManager = new SavingsManager();
	}
	
	setIncome(amount: number): void {
	  if (amount < 0) {
		throw new Error("Income cannot be negative");
	  }
	  this.income = amount;
	}
	
	getIncome(): number {
	  return this.income;
	}
	
	addExpense(category: string, amount: number): void {
	  this.expenseManager.addExpense({ category, amount });
	}
	
	setSpendingLimit(limit: number): void {
	  this.budgetManager.setSpendingLimit(limit);
	}
	
	setSavingGoal(goal: number): void {
	  this.savingsManager.setSavingGoal(goal);
	}
	
	getTotalExpenses(): number {
	  return this.expenseManager.getTotalExpenses();
	}
	
	getCategoryTotal(category: string): number {
	  return this.expenseManager.getCategoryTotal(category);
	}
	
	getExpensesByCategory(): Record<string, number> {
	  return this.expenseManager.getExpensesByCategory();
	}
	
	getUniqueCategories(): string[] {
	  return this.expenseManager.getUniqueCategories();
	}
	
	getCurrentSavings(): number {
	  return this.income - this.getTotalExpenses();
	}
	
	getSavingsProgress(): SavingsStatus {
	  return this.savingsManager.getSavingsStatus(this.income, this.getTotalExpenses());
	}
	
	generateFinancialReport(): { 
	  income: number;
	  expenses: Record<string, number>;
	  totalExpenses: number;
	  savingsProgress: SavingsStatus;
	  isOverBudget: boolean;
	  suggestions: string[];
	} {
	  const totalExpenses = this.getTotalExpenses();
	  const expensesByCategory = this.getExpensesByCategory();
	  const savingsProgress = this.getSavingsProgress();
	  const isOverBudget = this.budgetManager.isOverBudget(totalExpenses);
	  
	  const budgetSuggestion = this.budgetManager.generateSuggestion(totalExpenses);
	  const savingsSuggestion = this.savingsManager.generateSavingsSuggestion(this.income, totalExpenses);
	  
	  return {
		income: this.income,
		expenses: expensesByCategory,
		totalExpenses,
		savingsProgress,
		isOverBudget,
		suggestions: [budgetSuggestion, savingsSuggestion]
	  };
	}
  }