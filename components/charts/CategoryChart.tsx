import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Expense, Category } from '../../types';
import { CATEGORY_COLORS } from '../../constants';

interface CategoryChartProps {
  expenses: Expense[];
}

const CategoryChart: React.FC<CategoryChartProps> = ({ expenses }) => {
  const data = expenses.reduce((acc, expense) => {
    const existingCategory = acc.find(item => item.name === expense.category);
    if (existingCategory) {
      existingCategory.value += expense.amount;
    } else {
      acc.push({ name: expense.category, value: expense.amount });
    }
    return acc;
  }, [] as { name: string; value: number }[]);

  if (data.length === 0) {
    return <div className="text-center text-gray-500 dark:text-gray-400">No category data to display.</div>;
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
          nameKey="name"
          // FIX: The type from recharts is incorrect and missing the `percent` property. Casting to `any` to bypass the type error.
          label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
        >
          {data.map((entry) => (
            <Cell key={`cell-${entry.name}`} fill={CATEGORY_COLORS[entry.name as Category]} />
          ))}
        </Pie>
        <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default CategoryChart;