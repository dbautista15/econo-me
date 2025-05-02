/**
 * User model - Must match backend User interface in types.ts
 * Any changes here should be synchronized with the backend
 */

export interface User {
	id: number;
	username: string;
	email: string;
	created_at: Date;
  }
  
  export interface UserSettings {
	theme: 'light' | 'dark' | 'system';
	currency: string;
	dateFormat: string;
	notifications: {
	  email: boolean;
	  push: boolean;
	  budgetAlerts: boolean;
	};
	privacy: {
	  shareData: boolean;
	  analytics: boolean;
	};
	defaultView: 'monthly' | 'weekly' | 'yearly';
  }