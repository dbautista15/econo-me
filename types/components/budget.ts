import { CategorySummary, Suggestion } from '../domain/finance';
import { Income } from '../domain/finance';
/**
 * Budget component props
 */

export interface CategoryBudgetManagerProps {
  categories: string[];
  expensesByCategory: CategorySummary;
  categoryBudgets: Record<string, number>;
  colors?: string[];
  onUpdateBudget?: (category: string, limit: number) => void;
  onSaveBudget?: (category: string, limit: number) => void;
}

export interface IncomeGoalsProps {
  income: number;
  setIncome: (income: number) => void;
  spendingLimit: number;
  setSpendingLimit: (limit: number) => void;
  savingsGoal: number;
  setSavingsGoal: (goal: number) => void;
  expensesByCategory: CategorySummary;
  incomes: Income[];
  onSuccessMessage?: (msg: string) => void;
  onErrorMessage?: (msg: string) => void;
}

export interface SuggestionCardProps {
  suggestion: Suggestion;
  applyLimit: (limit: number) => void;
}

export interface SpendingLimitFormProps {
  limit: number;
  onSubmit: (value: number) => void;
  loading: boolean;
}

export interface SavingsGoalFormProps {
  goal: number;
  onSubmit: (value: number) => void;
  loading: boolean;
}