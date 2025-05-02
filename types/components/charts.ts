
// Basic data point for pie charts and bar charts
export interface ChartDataPoint {
	name: string;
	value: number;
  }
  
  // Data point for line charts with income and expenses
  export interface LineChartDataPoint {
	name: string;  // Usually a date or time period
	income: number;
	expenses: number;
  }
  
  // Data point for stacked bar charts with multiple categories
  export interface StackedBarChartDataPoint {
	name: string;  // Usually a date or time period
	[category: string]: string | number;  // Dynamic categories with their values
  }
  
  // Props for chart components
  export interface ChartProps {
	data: ChartDataPoint[] | LineChartDataPoint[] | StackedBarChartDataPoint[];
	colors?: string[];
	height?: number;
	width?: string | number;
  }
  
  // Specific props for different chart types
  export interface PieChartProps {
	data: ChartDataPoint[];
	colors: string[];
	height?: number;
  }
  
  export interface BarChartProps {
	data: ChartDataPoint[];
	colors: string[];
	height?: number;
  }
  
  export interface LineChartProps {
	data: LineChartDataPoint[];
	height?: number;
  }
  
  export interface StackedBarChartProps {
	data: StackedBarChartDataPoint[];
	categories: string[];
	colors: string[];
	height?: number;
  }