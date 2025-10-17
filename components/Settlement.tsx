import React, { useMemo } from 'react';
import { Expense, Traveler } from '../types';

interface SettlementProps {
  expenses: Expense[];
  travelers: Traveler[];
}

const Settlement: React.FC<SettlementProps> = ({ expenses, travelers }) => {
  const settlement = useMemo(() => {
    if (travelers.length === 0) return { balances: [], transactions: [] };

    const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const sharePerPerson = totalSpent / travelers.length;

    const balances = travelers.map(traveler => {
      const paid = expenses
        .filter(exp => exp.payerId === traveler.id)
        .reduce((sum, exp) => sum + exp.amount, 0);
      return {
        ...traveler,
        balance: paid - sharePerPerson,
      };
    });

    // Create deep copies for transaction calculation to avoid mutating the original balances array
    const debtors = balances
      .filter(t => t.balance < 0)
      .map(t => ({...t})) // Create a copy
      .sort((a, b) => a.balance - b.balance);
      
    const creditors = balances
      .filter(t => t.balance > 0)
      .map(t => ({...t})) // Create a copy
      .sort((a, b) => b.balance - a.balance);
    
    const transactions: { from: string; to: string; amount: number }[] = [];

    let debtorIndex = 0;
    let creditorIndex = 0;

    while (debtorIndex < debtors.length && creditorIndex < creditors.length) {
      const debtor = debtors[debtorIndex];
      const creditor = creditors[creditorIndex];
      const amountToTransfer = Math.min(-debtor.balance, creditor.balance);

      transactions.push({
        from: debtor.name,
        to: creditor.name,
        amount: amountToTransfer,
      });

      debtor.balance += amountToTransfer;
      creditor.balance -= amountToTransfer;

      if (Math.abs(debtor.balance) < 0.01) debtorIndex++;
      if (Math.abs(creditor.balance) < 0.01) creditorIndex++;
    }

    // Return the original, unmutated balances for display
    return { balances, transactions };
  }, [expenses, travelers]);

  const { balances, transactions } = settlement;

  return (
    <div className="space-y-6">
      <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Final Balances</h3>
        <ul className="space-y-3">
          {balances.map(t => (
            <li key={t.id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
              <div className="flex items-center gap-3">
                <img src={t.avatarUrl} alt={t.name} className="w-8 h-8 rounded-full" />
                <span className="font-medium text-gray-700 dark:text-gray-200">{t.name}</span>
              </div>
              <span className={`font-semibold ${t.balance >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {t.balance >= 0 ? `Is owed $${t.balance.toFixed(2)}` : `Owes $${(-t.balance).toFixed(2)}`}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Settlement Plan</h3>
        {transactions.length > 0 ? (
          <ul className="space-y-3">
            {transactions.map((txn, index) => (
              <li key={index} className="flex items-center justify-center text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                <span className="font-medium text-red-500">{txn.from}</span>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 mx-4 text-gray-500 dark:text-gray-400">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3" />
                </svg>
                <span className="font-semibold text-gray-800 dark:text-white">${txn.amount.toFixed(2)}</span>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 mx-4 text-gray-500 dark:text-gray-400">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3" />
                </svg>
                <span className="font-medium text-green-500">{txn.to}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-center text-gray-500 dark:text-gray-400">All expenses are settled!</p>
        )}
      </div>
    </div>
  );
};

export default Settlement;