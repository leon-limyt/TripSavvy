

import React, { useState } from 'react';
import { Expense, Traveler, Trip, Category } from '../types';
import CategoryChart from './charts/CategoryChart';
import DailySpendChart from './charts/DailySpendChart';
import ContributionChart from './charts/ContributionChart';
import Settlement from './Settlement';
import DailyBudgetComparisonChart from './charts/DailyBudgetComparisonChart';

interface DashboardProps {
  trip: Trip;
  updateTrip: (trip: Trip) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ trip, updateTrip }) => {
  const { expenses, travelers, destination, categoryBudget, startDate, endDate } = trip;
  const [newTravelerName, setNewTravelerName] = useState('');
  const [isEditingDestination, setIsEditingDestination] = useState(false);
  const [destinationInput, setDestinationInput] = useState(destination);

  // FIX: Explicitly type the accumulator in reduce to ensure totalSpending is a number.
  const totalSpending = expenses.reduce((sum: number, expense) => sum + expense.amount, 0);
  // FIX: Explicitly typed the accumulator (`sum`) and value (`val`) in the reduce function to prevent type errors when calculating the total budget from `Object.values`.
  // FIX: Changed `val: any` to `val: unknown` for better type safety. The `Number()` constructor can safely handle `unknown` types.
  const totalBudget: number = categoryBudget ? Object.values(categoryBudget).reduce((sum: number, val: unknown) => sum + (Number(val) || 0), 0) : 0;

  const budgetProgress = totalBudget > 0 ? (totalSpending / totalBudget) * 100 : 0;
  
  let dailyBudget = 0;
  if (startDate && endDate && totalBudget > 0) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      // Ensure we compare dates properly, ignoring time parts
      const diffTime = end.setHours(0,0,0,0) - start.setHours(0,0,0,0);
      if (diffTime >= 0) {
        const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end dates
        if (diffDays > 0) {
            dailyBudget = totalBudget / diffDays;
        }
      }
  }

  const getProgressBarColor = (progress: number) => {
      if (progress > 100) return 'bg-red-500';
      if (progress > 80) return 'bg-yellow-400';
      return 'bg-green-500';
  }

  const handleAddTraveler = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTravelerName.trim()) return;

    const newTraveler: Traveler = {
      id: `traveler-${Date.now()}`,
      name: newTravelerName.trim(),
      avatarUrl: `https://i.pravatar.cc/150?u=${encodeURIComponent(newTravelerName.trim())}`,
    };

    updateTrip({ ...trip, travelers: [...travelers, newTraveler] });
    setNewTravelerName('');
  };
  
  const handleUpdateDestination = () => {
    if (destinationInput.trim() === '') return;
    updateTrip({ ...trip, destination: destinationInput.trim() });
    setIsEditingDestination(false);
  };

  // FIX: Explicitly specify the return type as number to help TypeScript's inference.
  const spendingByCategory = (category: Category): number => {
    // FIX: Explicitly type the accumulator in reduce to ensure the function returns a number.
    return expenses.filter(e => e.category === category).reduce((sum: number, e) => sum + e.amount, 0);
  }

  return (
    <div className="space-y-8 p-4 md:p-8">
      <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md space-y-6">
        <div className="flex justify-between items-start">
            <div>
                 {isEditingDestination ? (
                    <div className="flex items-center gap-2">
                        <input
                            type="text"
                            value={destinationInput}
                            onChange={(e) => setDestinationInput(e.target.value)}
                            className="text-2xl font-bold bg-transparent border-b-2 border-primary-500 focus:outline-none text-gray-900 dark:text-white"
                            autoFocus
                        />
                        <button onClick={handleUpdateDestination} className="px-3 py-1 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700">Save</button>
                        <button onClick={() => setIsEditingDestination(false)} className="px-3 py-1 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-200 dark:bg-gray-600 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500">Cancel</button>
                    </div>
                ) : (
                    <div className="flex items-center gap-3">
                        <h2 className="text-3xl font-bold text-gray-800 dark:text-white">Trip to {destination}</h2>
                        <button onClick={() => { setDestinationInput(destination); setIsEditingDestination(true); }} className="p-1 text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400">
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" /></svg>
                        </button>
                    </div>
                )}
                <p className="text-lg text-gray-500 dark:text-gray-400 mt-1">Total Spent: <span className="font-bold text-primary-600 dark:text-primary-400">${totalSpending.toFixed(2)}</span></p>

                 {/* Budget Progress Display */}
                {totalBudget > 0 ? (
                    <div className="mt-4 space-y-4">
                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Overall Budget Progress</span>
                                <span className={`text-sm font-bold ${budgetProgress > 100 ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'}`}>
                                    {budgetProgress.toFixed(1)}%
                                </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                                <div 
                                    className={`h-2.5 rounded-full ${getProgressBarColor(budgetProgress)}`} 
                                    style={{ width: `${Math.min(budgetProgress, 100)}%` }}
                                ></div>
                            </div>
                            <p className="text-right text-xs text-gray-500 dark:text-gray-400 mt-1">
                                ${totalSpending.toFixed(2)} of ${totalBudget.toFixed(2)} spent
                            </p>
                        </div>
                        {/* Category Breakdown */}
                        <div className="space-y-2">
                             <h4 className="text-md font-semibold text-gray-800 dark:text-white">Category Budgets</h4>
                             {/* FIX: Safely convert budgetValue to a number to fix type errors. */}
                             {Object.entries(categoryBudget || {}).map(([category, budgetValue]) => {
                                // FIX: Use a type guard to ensure budgetValue is a number and not unknown/undefined.
                                const budget = Number(budgetValue);
                                if (isNaN(budget) || budget <= 0) {
                                    return null;
                                }
                                const spent = spendingByCategory(category as Category);
                                const progress = (spent / budget) * 100;
                                return (
                                    <div key={category}>
                                        <div className="flex justify-between items-center text-xs mb-0.5">
                                            <span className="font-medium text-gray-600 dark:text-gray-300">{category}</span>
                                            <span>${spent.toFixed(2)} / ${budget.toFixed(2)}</span>
                                        </div>
                                         <div className="w-full bg-gray-200 rounded-full h-1.5 dark:bg-gray-700">
                                            <div 
                                                className={`h-1.5 rounded-full ${getProgressBarColor(progress)}`} 
                                                style={{ width: `${Math.min(progress, 100)}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                )
                             })}
                        </div>
                    </div>
                ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
                        No budget set. You can add one in the <strong className="font-medium">Settings</strong> tab.
                    </p>
                )}
            </div>
        </div>
        
        <div>
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-3">Travelers</h3>
            {travelers.length > 0 ? (
                 <ul className="space-y-3 mb-4">
                    {travelers.map(t => (
                        <li key={t.id} className="flex items-center gap-3 p-2 bg-gray-50 dark:bg-gray-700 rounded-md">
                            <img src={t.avatarUrl} alt={t.name} className="w-8 h-8 rounded-full object-cover" />
                            <span className="font-medium text-gray-700 dark:text-gray-200">{t.name}</span>
                        </li>
                    ))}
                 </ul>
            ) : (
                <p className="text-gray-500 dark:text-gray-400 mb-4 text-sm">No travelers added yet. Add one to start logging expenses!</p>
            )}
           <form onSubmit={handleAddTraveler} className="flex gap-2">
                <input
                    type="text"
                    value={newTravelerName}
                    onChange={(e) => setNewTravelerName(e.target.value)}
                    placeholder="Enter traveler's name"
                    className="flex-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                />
                <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg shadow-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">Add Traveler</button>
            </form>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md lg:col-span-2">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Daily Spending vs. Budget</h3>
            {dailyBudget > 0 && startDate && endDate ? (
                <DailyBudgetComparisonChart 
                    expenses={expenses} 
                    dailyBudget={dailyBudget} 
                    startDate={startDate}
                    endDate={endDate}
                />
            ) : (
                <div className="text-center text-gray-500 dark:text-gray-400 h-[300px] flex items-center justify-center">
                    <p>Set a trip duration and a category budget in <strong className="font-medium">Settings</strong> to see this chart.</p>
                </div>
            )}
        </div>
        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Spending by Category</h3>
            <CategoryChart expenses={expenses} />
        </div>
        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Daily Spending</h3>
            <DailySpendChart expenses={expenses} />
        </div>
        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Traveler Contributions</h3>
            <ContributionChart expenses={expenses} travelers={travelers} />
        </div>
         <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
             <Settlement expenses={expenses} travelers={travelers} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;