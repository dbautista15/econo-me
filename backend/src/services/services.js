/**
 * Econome Class
 * 
 * A personal finance management class that tracks income, expenses,
 * spending limits, and saving goals, while providing financial suggestions.
 * 
 * @class Econome
 */
class Econome {
	/**
	 * Creates a new Econome instance with default values
	 */
	constructor(){
		this.income = 0;
		this.expenses = [];
		this.spendingLimit = 0;
		this.savingGoal = 0;
		this.savingProgress = '';
	}

	/**
	 * Adds a new expense to the expenses array
	 * 
	 * @param {string} category - The expense category
	 * @param {number} amount - The expense amount
	 */
	addExpense(category, amount){
		const expense = {};
		expense[category] = amount;
		this.expenses.push(expense);
		this.categorizeExpenses();
	}

	/**
	 * Categorizes and summarizes expenses by category
	 * Logs expense summaries to the console
	 */
	categorizeExpenses(){
		const expensesByCategory = {
			Food: [],
			Gas: [],
			MortgageRent: [],
			Utilities: [],
			Wants: []
		};
		
		this.expenses.forEach(expense => {
			const category = Object.keys(expense)[0];
			const amount = expense[category];

			if(expensesByCategory[category]){
				expensesByCategory[category].push(amount);
			} else{
				console.error(`Category ${category} doset exist in expensesByCategory.`);
				expensesByCategory[category] = [amount];
			}
		});
		
		console.log('Expenses Summary');
		for(const category in expensesByCategory){
			const totalAmount = expensesByCategory[category].reduce((acc, curr) => acc + curr, 0);
			console.log(`Category: ${category}, Total Amount: $${totalAmount}`);
		}
		
		this.logExpenseCategories();
	}
	
	/**
	 * Sets the spending limit
	 * 
	 * @param {number} limit - The maximum amount to spend
	 */
	setSpendingLimit(limit){
		this.spendingLimit = limit;
	}
	
	/**
	 * Sets the saving goal
	 * 
	 * @param {number} goal - The target amount to save
	 */
	setSavingGoal(goal){
		this.savingGoal = goal;
	}
	
	/**
	 * Generates spending suggestions based on spending limit
	 * 
	 * @returns {string} A suggestion based on spending behavior
	 */
	generateSuggestions(){
		const totalExpenses = this.expenses.reduce((acc, expense) => acc + Object.values(expense)[0], 0);

		if(totalExpenses > this.spendingLimit){
			return 'Considering reducing spending on non essential items.';
		} else {
			return 'Great Job on managing expenses!';
		}
	}
	
	/**
	 * Tracks progress towards saving goal and provides suggestions
	 * Logs progress information to the console
	 */
	trackSavingProgress(){
		const totalExpenses = this.expenses.reduce((acc, expense) => acc + Object.values(expense)[0], 0);
		const savingsProgress = this.income - totalExpenses;
		const spendingStatus = totalExpenses > this.spendingLimit;

		let suggestions;
		if(savingsProgress < this.savingGoal){
			const remaining = this.savingGoal - savingsProgress;
			suggestions = `You are ${Math.abs(remaining)} away from your savings goal. Keep track of your spending to reach your goal!`;
		} else {
			suggestions = 'Congratulations! You have reached your savings goal. Consider allocating surplus finds wisely.';
		}
		
		this.savingProgress = savingsProgress < this.savingGoal ? 'Not Reached' : 'Reached';

		console.log(`Savings Progress: ${this.savingProgress}`);
		console.log(`Spending Status: ${spendingStatus ? 'Exceeded' : 'Within Limit'}`);
		console.log(`Suggestions: ${suggestions}`);
	}
	
	/**
	 * Returns the current saving progress status
	 * 
	 * @returns {string} 'Reached' or 'Not Reached'
	 */
	getSavingProgress(){
		return this.savingProgress;
	}
	
	/**
	 * Logs unique expense categories to the console
	 */
	logExpenseCategories(){
		const uniqueCategories = [];
		this.expenses.forEach(expense => {
			const category = Object.keys(expense)[0];
			if(!uniqueCategories.includes(category)){
				uniqueCategories.push(category);
			}
		});
		
		console.log(`Unique Categories in Expenses: ${uniqueCategories}`);
	}
	
	/**
	 * Calculates the total of all expenses
	 * 
	 * @returns {number} The sum of all expenses
	 */
	getTotalExpenses() {
		return this.expenses.reduce((total, expense) => total + Object.values(expense)[0], 0);
	}
	
	/**
	 * Calculates the total for a specific expense category
	 * 
	 * @param {string} category - The expense category to total
	 * @returns {number} The sum of expenses for the specified category
	 */
	getCategoryTotal(category) {
		return this.expenses.reduce((total, expense) => {
			if (expense[category]) {
				return total + expense[category];
			}
			return total;
		}, 0);
	}
	
	/**
	 * Validates if the spending limit is a valid value
	 * 
	 * @returns {boolean} True if spending limit is valid (>= 0)
	 */
	handleInvalidInputGracefully(){
		return this.spendingLimit >= 0;
	}
}

module.exports = Econome;