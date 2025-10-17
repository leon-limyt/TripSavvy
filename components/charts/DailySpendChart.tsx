import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Expense, Category } from '../../types';
import { CATEGORY_COLORS } from '../../constants';

interface DailySpendChartProps {
  expenses: Expense[];
}


const DailySpendChart: React.FC<DailySpendChartProps> = ({ expenses }) => {
  // Process expenses to group them by date and then by category
  const processedData = expenses.reduce((acc, expense) => {
    const date = new Date(expense.date).toLocaleDateString();
    
    // If the date is not yet in our accumulator, initialize it
    if (!acc[date]) {
      acc[date] = { date };
      // Initialize all categories with 0 to ensure they appear in the stack
      Object.values(Category).forEach(cat => {
        acc[date][cat] = 0;
      });
    }
    
    // Add the expense amount to the correct category for that date
    acc[date][expense.category] = (acc[date][expense.category] || 0) + expense.amount;

    return acc;
  }, {} as Record<string, { date: string } & Partial<Record<Category, number>>>);

  // Convert the processed data object to an array and sort it by date
  // FIX: Explicitly type `a` and `b` to avoid `unknown` type errors when accessing `a.date` and `b.date`.
  const data = Object.values(processedData).sort((a: { date: string }, b: { date: string }) => new Date(a.date).getTime() - new Date(b.date).getTime());


  if (data.length === 0) {
    return <div className="text-center text-gray-500 dark:text-gray-400">No daily spending data to display.</div>;
  }
  
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
        <Legend />
        {/* Map over categories to create a stacked Bar for each one */}
        {Object.values(Category).map(cat => (
           <Bar 
             key={cat} 
             dataKey={cat} 
             stackId="a" // This ID groups the bars into a single stack
             name={cat} 
             fill={CATEGORY_COLORS[cat]} 
           />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
};

export default DailySpendChart;