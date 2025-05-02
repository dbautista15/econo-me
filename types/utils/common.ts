/**
 * Common utility types
 */

export interface MessageState {
	success: string;
	error: string;
  }
  
  export interface LoadingState {
	fetch: boolean;
	delete: boolean;
  }
  
  export interface UseBudgetServiceParams {
	onSuccess: (msg: string) => void;
	onError: (msg: string) => void;
  }