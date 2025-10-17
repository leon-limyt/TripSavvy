
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Expense, Traveler } from '../../types';

interface ContributionChartProps {
  expenses: Expense[];
  travelers: Traveler[];
}

const ContributionChart: React.FC<ContributionChartProps> = ({ expenses, travelers }) => {
  const data = travelers.map(traveler => {
    const totalPaid = expenses
      .filter(expense => expense.payerId === traveler.id)
      .reduce((sum, expense) => sum + expense.amount, 0);
    return { name: traveler.name, amount: totalPaid };
  });

  if (travelers.length === 0) {
    return <div className="text-center text-gray-500 dark:text-gray-400">No traveler data to display.</div>;
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} layout="vertical">
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis type="number" />
        <YAxis dataKey="name" type="category" width={80} />
        <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
        <Legend />
        <Bar dataKey="amount" fill="#00C49F" name="Total Paid" />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default ContributionChart;
