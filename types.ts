export enum Category {
  Meals = "Meals",
  Transport = "Transport",
  Accommodation = "Accommodation",
  AdmissionFee = "Admission Fee",
  Other = "Other",
}

export interface Traveler {
  id: string;
  name: string;
  avatarUrl: string;
}

export interface Expense {
  id: string;

  name: string;
  amount: number;
  category: Category;
  payerId: string;
  date: string; // ISO string
  location: string;
  receiptImageUrl?: string;
}

export type CategoryBudget = Partial<Record<Category, number>>;

export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
}

export interface OCRExtraction {
    merchant: string;
    totalAmount: number;
    date: string; // YYYY-MM-DD
    suggestedCategory: Category;
}

export interface User {
  id: string; // email
  name: string;
  avatarUrl?: string;
}

export interface Trip {
  id: string;
  destination: string;
  travelers: Traveler[];
  expenses: Expense[];
  categoryBudget?: CategoryBudget;
  startDate?: string; // ISO string YYYY-MM-DD
  endDate?: string; // ISO string YYYY-MM-DD
}