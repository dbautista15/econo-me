import { ReactNode } from 'react';

export interface CategoryContextType {
  categories: string[];
  loading: boolean;
  error: string | null;
  addCategory: (newCategory: string) => Promise<boolean>;
}

export interface CategoryProviderProps {
  children: ReactNode;
}