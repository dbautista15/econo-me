

class Econome {
	constructor(){
		this.income = 0;
		this.expenses =[];
		this.spendingLimit=0;
		this.savingGoal=0;
		this.savingProgress='';
	}

	addExpense(category, amount){
		const expense ={};
		expense[category]=amount;
		this.expenses.push(expense);
		this.categoriseExpenses();
	}

	categorizeExpenses(){
		const expensesByCategory = {
			Food:[],
			Gas:[],
			MortgageRent:[],
			Utilities:[],
			Wants:[]

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
			const totalAmount = expensesByCategory[category].reduce((acc, curr)=>acc+curr,0);
			console.log(`Category: ${category}, Total Amount: $${totalAmount}`);
		}
		this.logExpenseCategories();
	}
	setSpendingLimit(limit){
		this.spendingLimit = limit;
	}
	setSavingGoal(goal){
		this.savingGoal = goal;
	}
	generateSuggestions(){
		const totalExpenses = this.expenses.reduce((acc,expense)=> acc+Object.values(expense)[0],0);

		if(totalExpenses>this.spendingLimit){
			return 'Considering reducing spending on non essential items.';
		}else{
			return 'Great Job on managing expenses!';
		}
	}
	trackSavingProgress(){
		const totalExpenses = this.expenses.reduce((acc,expense)=>acc+Object.values(expense)[0],0);
		const savingsProgress = this.income - totalExpenses;
		const spendingStatus = totalExpenses > this.spendingLimit;

		let suggestions;
		if(savingsProgress<this.savingGoal){
			const remaining = this.savingGoal - savingsProgress;
			suggestions = `You are ${Math.abs(remaining)} away from your savings goal. Keep track of your spending to reach your goal!`;
		}else{
			suggestions = 'Congratulations! You have reached your savings goal. Consider allocating surplus finds wisely.';
		}
		this.savingProgress = savingsProgress < this.savingGoal ? 'Not Reached' : 'Reached';

		console.log(`Savings Progress: ${this.savingProgress}`);
		console.log(`Spending Status: ${spendingStatus ? 'Exceeded':'Within Limit'}`);
		console.log(`Suggestions: ${suggestions}`);
		
	}
	getSavingProgress(){
		return this.savingProgress
	}
	logExpenseCategories(){
		const uniqueCategories =[];
		this.expenses.forEach(expense => {
			const category = Object.keys(expense)[0];
			if(!uniqueCategories.includes(category)){
				uniqueCategories.push(category);
			}
		});
		console.log(`Unique Categories in Expenses: ${uniqueCategories}`);
	}
	getTotalExpenses(){
		return this.expenses.reduce((toalt,expense)=> total+Object.values(expense)[0],0);
	}
	getCategoryTotal(category){
		return this.expense.reduce((total,expense)=>{
			if(expense[category]){
				return total + expense[category];
			}
			return total;
		},0);
	}
	handleInvalidInputGracefully(){
		return this.spendingLimit >= 0;
	}
}
module.exports = Econome;