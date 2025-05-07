/**
 * Finance related types and interfaces
 * Core domain models for the financial aspects of the application
 */

// Basic finance models
export interface Expense {
	id: number;
	userId: number;
	category: string;
	amount: number;
	date: string;
	expense_date: string | Date;
	description: string;
	recurring?: boolean;
	frequency?: string;
	user_id?: number;
	created_at?: string | Date;
  }
  
  export interface Income {
	id: number;
	userId: number;
	source: string;
	amount: number;
	date: string;
	income_date: string | Date;
	description: string;
	recurring?: boolean;
	frequency?: string;
	user_id?: number;
	created_at?: string | Date;
  }
  
  export interface Budget {
	id: number;
	userId: number;
	category: string;
	amount: number;
	period: string;
	user_id: number;
	created_at: Date;
  }
  
  export interface SavingsGoal {
	id: number;
	userId?: number;
	name: string;
	targetAmount: number;
	currentAmount: number;
	targetDate: string | Date | null;
	priority?: string;
	user_id: number;
	target_amount: number;
	current_amount: number;
	created_at?: Date;
  }
  
  export interface Suggestion {
	daily: number;
	frequency: string | null;
	nextDate: string;
	id?: number;
	title?: string;
	description?: string;
	limit?: number;
  }
  
  // Form data types
  export interface ExpenseForm {
	category: string;
	amount: string | number;
	date: string;
	description: string;
	recurring?: boolean;
	frequency?: string;
  }
  
  export interface SavingsGoalFormData {
	name: string;
	targetAmount: number | string;
	currentAmount: number | string;
	targetDate: string;
	priority: string;
  }
  
  // Form errors handling
  export interface FormErrors {
	[key: string]: string | undefined;
	category?: string;
	amount?: string;
	date?: string;
	description?: string;
	recurring?: string;
	frequency?: string;
	name?: string;
	targetAmount?: string;
	currentAmount?: string;
	targetDate?: string;
	priority?: string;
	goal?: string;
	limit?: string;
  }
  
  // Result types
  export interface DeletionResults {
	success: number;
	failed: number;
	total: number;
	successfulIds?: number[];
	failedIds?: number[];
  }
  
  // Filter types
  export enum ExpenseFilterType {
	All = 'all',
	ThisMonth = 'thisMonth',
	LastMonth = 'lastMonth',
	ThisYear = 'thisYear',
	Custom = 'custom'
  }
  
  export enum ExpenseCategory {
	Food = 'Food',
	Transportation = 'Transportation',
	Housing = 'Housing',
	Utilities = 'Utilities',
	Entertainment = 'Entertainment',
	Healthcare = 'Healthcare',
	DiningOut = 'Dining Out',
	Shopping = 'Shopping',
	Uncategorized = 'Uncategorized'
  }
  
  // Prop types related to finance components
  export interface SuggestionProps {
	suggestion: Suggestion;
	applyLimit: (amount: number) => void;
  }
  
  export interface SuggestionCardProps extends SuggestionProps {
	// Any additional props specific to the card implementation
  }
  
  export interface BudgetManagerProps {
	categories: string[];
	expensesByCategory: CategorySummary;
	budgets: Record<string, number>;
	colors?: string[];
	onBudgetUpdate?: (category: string, limit: number) => void;
	onBudgetSave?: (category: string, limit: number) => void;
  }
  
  export interface FinancialGoalsProps {
	income: number;
	setIncome: (income: number) => Promise<boolean>;
	spendingLimit: number;
	setSpendingLimit: (limit: number) => void;
	expensesByCategory: CategorySummary;
	incomes: Income[];
	onSuccess?: (message: string) => void;
	onError?: (message: string) => void;
  }
  
  export interface SpendingLimitFormProps {
	currentLimit: number;
	onSubmit: (value: number) => void;
	isLoading?: boolean;
  }
  
  export interface SavingsGoalFormProps {
	currentGoal: number;
	onSubmit: (value: number) => void;
	isLoading?: boolean;
  }
  
  export interface IncomeEntryProps {
	initialAmount?: string;
	initialDate?: string;
	onSuccess?: () => void;
  }
  
  export interface IncomeListProps {
	incomes: Income[];
	onRefresh: () => void;
	onSuccess: (message: string) => void;
	onError: (message: string) => void;
  }
  
  export interface SavingsGoalManagementProps {
	goals: SavingsGoal[];
	onAddGoal: (goal: Partial<SavingsGoal>) => Promise<boolean>;
	onUpdateGoal: (id: number, updates: Partial<SavingsGoal>) => Promise<boolean>;
	onDeleteGoal: (id: number) => Promise<boolean>;
	onAdjustGoalAmount: (id: number, amount: number, type: 'deposit' | 'withdraw') => Promise<boolean>;
  }
  
  export interface ExpenseDistributionProps {
	expensesByCategory: CategorySummary;
	colors?: string[];
	totalExpenses?: number;
  }
  
  // Utility types
  export type CategorySummary = Record<string, number>;