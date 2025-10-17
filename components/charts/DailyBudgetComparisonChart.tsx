import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Expense, Category } from '../../types';
import { CATEGORY_COLORS } from '../../constants';

interface DailyBudgetComparisonChartProps {
  expenses: Expense[];
  dailyBudget: number;
  startDate: string;
  endDate: string;
}

const DailyBudgetComparisonChart: React.FC<DailyBudgetComparisonChartProps> = ({ expenses, dailyBudget, startDate, endDate }) => {
  // 1. Generate all dates in the range, using UTC to avoid timezone issues
  const dates: Date[] = [];
  let currentDate = new Date(startDate + 'T00:00:00Z');
  const end = new Date(endDate + 'T00:00:00Z');
  
  // Safety break to prevent infinite loops with invalid dates
  let i = 0;
  while (currentDate <= end && i < 365) {
    dates.push(new Date(currentDate));
    currentDate.setUTCDate(currentDate.getUTCDate() + 1);
    i++;
  }
  
  // 2. Aggregate expenses by date and category for efficient lookup
  const expensesByDate = expenses.reduce((acc, expense) => {
    // Key by YYYY-MM-DD format from the ISO string
    const dateKey = expense.date.split('T')[0];
    if (!acc[dateKey]) {
      acc[dateKey] = {};
    }
    const category = expense.category as Category;
    acc[dateKey][category] = (acc[dateKey][category] || 0) + expense.amount;
    return acc;
  }, {} as Record<string, Record<Category, number>>);

  // 3. Create the data structure for the chart
  const data = dates.map(date => {
    const dateKey = date.toISOString().split('T')[0];
    const dailyExpenses = expensesByDate[dateKey] || {};
    
    const dayData: { date: string; budget: number; [key: string]: any } = {
      // Format date for display on the X-axis (e.g., "Aug 15")
      date: date.toLocaleDateString(undefined, { timeZone: 'UTC', month: 'short', day: 'numeric' }),
      budget: dailyBudget
    };

    Object.values(Category).forEach(cat => {
      dayData[cat] = dailyExpenses[cat] || 0;
    });
    
    return dayData;
  });

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
        <Legend />
        <Bar dataKey="budget" fill="#8884d8" name="Daily Budget" />
        {Object.values(Category).map(cat => (
          <Bar
            key={cat}
            dataKey={cat}
            stackId="actual"
            name={cat}
            fill={CATEGORY_COLORS[cat]}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
};

export default DailyBudgetComparisonChart;
