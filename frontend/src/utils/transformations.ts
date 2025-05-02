export const transformations = {
	/**
	 * Parses a value to a float number
	 */
	parseAmount: (amount: number | string): number => {
	  return typeof amount === 'string' ? parseFloat(amount) : amount;
	},
	
	/**
	 * Converts a date to ISO string format
	 */
	formatDate: (date: string | Date): string => {
	  return date instanceof Date ? date.toISOString() : new Date(date).toISOString();
	},
	
	/**
	 * Calculates sum of numeric values
	 */
	sumValues: (values: number[]): number => {
	  return values.reduce((sum, val) => sum + val, 0);
	},
	
	/**
	 * Calculates percentage
	 */
	calculatePercentage: (value: number, total: number): number => {
	  return total > 0 ? (value / total) * 100 : 0;
	},
	  /**
   * Formats a number as currency with 2 decimal places
   */
	  formatCurrency: (value: number | string): string => {
		const numValue = typeof value === 'string' ? parseFloat(value) : value;
		return isNaN(numValue) ? '0.00' : numValue.toFixed(2);
	  },
	  
	  /**
	   * Formats a number as a percentage with 0 decimal places
	   */
	  formatPercentage: (value: number | string): string => {
		const numValue = typeof value === 'string' ? parseFloat(value) : value;
		return isNaN(numValue) ? '0' : Math.round(numValue).toString();
	  }
  };