/**
 * Chart data types
 */

export interface CategoryData {
	name: string;
	value: number;
  }
  
  export interface CategoryBreakdownChartProps {
	pieChartData: CategoryData[];
	colors: string[];
  }
  
  export interface ChartDataPoint {
	name: string;
	value: number;
  }
  
  export interface LineChartDataPoint {
	name: string;
	income: number;
	expenses: number;
  }
  
  export interface StackedBarChartDataPoint {
	name: string;
	[category: string]: string | number; // Allow dynamic category keys
  }