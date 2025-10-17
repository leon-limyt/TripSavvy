import { Traveler, Expense, CategoryBudget, Category } from './types';

// Mock data has been cleared to allow for dynamic, user-inputted data.
// The application will now start with a blank slate.

export const TRAVELERS: Traveler[] = [];

export const INITIAL_EXPENSES: Expense[] = [];

export const DAILY_BUDGET: CategoryBudget = {};

export const TRIP_DESTINATION = "My First Trip";

// Consistent color mapping for expense categories across all charts
export const CATEGORY_COLORS: Record<Category, string> = {
  [Category.Meals]: '#3b82f6', // blue-500
  [Category.Transport]: '#10b981', // emerald-500
  [Category.Accommodation]: '#f97316', // orange-500
  [Category.AdmissionFee]: '#ef4444', // red-500
  [Category.Other]: '#8b5cf6', // violet-500
};