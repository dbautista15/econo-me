// Updated ui.ts with fixed NavigationProps

import { ReactNode, InputHTMLAttributes, Dispatch, SetStateAction } from 'react';

/**
 * UI Component Props
 */

export type MessageType = 'success' | 'error';
export type TabType = 'dashboard' | 'settings';

export interface AlertState {
  message: string;
  type: MessageType | null;
}

export interface AlertProps {
  type: MessageType;
  message: string;
}

export interface SubmitButtonProps {
  text: string;
  loading: boolean;
}

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export interface SectionProps {
  title: string;
  children: ReactNode;
  full?: boolean;
}

export interface ProgressProps {
  label: string;
  percent: number;
  color: string;
}

export interface InsightProps {
  label: string;
  text: string;
}

// Fixed NavigationProps to use TabType
export interface NavigationProps {
  activeTab: TabType;  // Changed from string to TabType
  setActiveTab: Dispatch<SetStateAction<TabType>>; 
}

export interface NotificationMessageProps {
  message: string;
  type: MessageType;
}

export interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  color?: string;
}