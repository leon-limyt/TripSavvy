import React, { useState, useCallback, useEffect } from 'react';
import { Expense, Traveler, Category, OCRExtraction, User } from '../types';
import { extractReceiptData } from '../services/geminiService';

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

const base64WithoutPrefix = (base64: string) => base64.split(',')[1];

const ExpenseModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSave: (expense: Omit<Expense, 'id'> | Expense) => void;
  travelers: Traveler[];
  expenseToEdit?: Expense | null;
  currentUser: User;
}> = ({ isOpen, onClose, onSave, travelers, expenseToEdit, currentUser }) => {
  const [expenseName, setExpenseName] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<Category>(Category.Meals);
  const [payerId, setPayerId] = useState(currentUser.id);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [location, setLocation] = useState('');
  const [receiptImage, setReceiptImage] = useState<string | null>(null);
  const [isOcrLoading, setIsOcrLoading] = useState(false);
  const [ocrError, setOcrError] = useState('');
  
  const canAddExpense = travelers.length > 0;
  const isEditMode = !!expenseToEdit;

  useEffect(() => {
    if (isOpen) {
        if (isEditMode) {
            setExpenseName(expenseToEdit.name);
            setAmount(String(expenseToEdit.amount));
            setCategory(expenseToEdit.category);
            setPayerId(expenseToEdit.payerId);
            setDate(new Date(expenseToEdit.date).toISOString().split('T')[0]);
            setLocation(expenseToEdit.location || '');
            setReceiptImage(expenseToEdit.receiptImageUrl || null);
        } else {
            // Reset for "Add" mode
            setExpenseName('');
            setAmount('');
            setCategory(Category.Meals);
            setPayerId(currentUser.id); // Default to current user
            setDate(new Date().toISOString().split('T')[0]);
            setLocation('');
            setReceiptImage(null);
        }
        setOcrError('');
        setIsOcrLoading(false);
    }
  }, [isOpen, isEditMode, expenseToEdit, currentUser.id]);

  const handleReceiptUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsOcrLoading(true);
    setOcrError('');
    try {
        const base64 = await fileToBase64(file);
        setReceiptImage(base64); // Store full base64 for display and later processing
        const base64Data = base64WithoutPrefix(base64);

        const result = await extractReceiptData(base64Data, file.type);
        if (result) {
            setExpenseName(result.merchant || '');
            setAmount(result.totalAmount?.toString() || '');
            setCategory(result.suggestedCategory || Category.Other);
            if (result.date) {
              setDate(new Date(result.date).toISOString().split('T')[0]);
            }
        } else {
            setOcrError('Failed to extract data. Please enter manually.');
        }
    } catch (err) {
        console.error(err);
        setOcrError('An error occurred during OCR processing.');
    } finally {
        setIsOcrLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseName || !amount || !canAddExpense) return;

    const expenseData = {
      name: expenseName,
      amount: parseFloat(amount),
      category,
      payerId,
      date: new Date(date).toISOString(),
      location,
      receiptImageUrl: receiptImage || undefined,
    };

    if (isEditMode) {
        onSave({ ...expenseToEdit, ...expenseData });
    } else {
        onSave(expenseData);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md m-4 max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">{isEditMode ? 'Edit Expense' : 'Add New Expense'}</h2>
        
        {!canAddExpense && (
            <div className="p-4 mb-4 text-sm text-yellow-800 rounded-lg bg-yellow-50 dark:bg-gray-800 dark:text-yellow-300" role="alert">
                You must add at least one traveler on the <strong className="font-semibold">Overview</strong> tab before logging an expense.
            </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Upload Receipt (Optional)</label>
                 <input type="file" accept="image/*" onChange={handleReceiptUpload} disabled={!canAddExpense} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 disabled:opacity-50"/>
                 {isOcrLoading && <p className="text-sm text-primary-500 mt-2">Analyzing receipt...</p>}
                 {ocrError && <p className="text-sm text-red-500 mt-2">{ocrError}</p>}
                 {receiptImage && !isOcrLoading && <img src={receiptImage} alt="Receipt Preview" className="mt-2 rounded-md max-h-32 object-contain" />}
            </div>
            <div className="w-full h-px bg-gray-200 dark:bg-gray-700"></div>
            <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Expense Name</label>
                <input type="text" id="name" value={expenseName} onChange={(e) => setExpenseName(e.target.value)} required disabled={!canAddExpense} className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm disabled:opacity-50"/>
            </div>
            <div>
                <label htmlFor="amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Amount ($)</label>
                <input type="number" id="amount" value={amount} onChange={(e) => setAmount(e.target.value)} required disabled={!canAddExpense} className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm disabled:opacity-50"/>
            </div>
            <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Category</label>
                <select id="category" value={category} onChange={(e) => setCategory(e.target.value as Category)} disabled={!canAddExpense} className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm disabled:opacity-50">
                    {Object.values(Category).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
            </div>
             <div>
                <label htmlFor="payer" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Paid By</label>
                <select id="payer" value={payerId} onChange={(e) => setPayerId(e.target.value)} disabled={!canAddExpense} className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm disabled:opacity-50">
                    {travelers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
            </div>
             <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Date</label>
                <input type="date" id="date" value={date} onChange={(e) => setDate(e.target.value)} required disabled={!canAddExpense} className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm disabled:opacity-50"/>
            </div>
            <div className="flex justify-end space-x-2 pt-2">
                <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:bg-gray-600 dark:text-gray-200 dark:border-gray-500 dark:hover:bg-gray-500">Cancel</button>
                <button type="submit" disabled={!canAddExpense} className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:bg-gray-400 disabled:cursor-not-allowed">Save Expense</button>
            </div>
        </form>
      </div>
    </div>
  );
};

const DeleteConfirmationModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    expenseName: string;
}> = ({ isOpen, onClose, onConfirm, expenseName }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-sm m-4">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Confirm Deletion</h3>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">Are you sure you want to delete the expense "{expenseName}"? This action cannot be undone.</p>
                <div className="mt-6 flex justify-end space-x-3">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 dark:bg-gray-600 dark:text-gray-200 dark:border-gray-500 dark:hover:bg-gray-500">
                        Cancel
                    </button>
                    <button onClick={onConfirm} className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md shadow-sm hover:bg-red-700">
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
};

const ReceiptViewerModal: React.FC<{
    imageUrl: string | null;
    onClose: () => void;
}> = ({ imageUrl, onClose }) => {
    if (!imageUrl) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-50 p-4" onClick={onClose}>
            <img src={imageUrl} alt="Receipt" className="max-w-full max-h-full object-contain rounded-lg" />
            <button className="absolute top-4 right-4 text-white text-2xl font-bold">&times;</button>
        </div>
    )
}

interface ExpensesProps {
  expenses: Expense[];
  travelers: Traveler[];
  addExpense: (expense: Omit<Expense, 'id'>) => void;
  editExpense: (expense: Expense) => void;
  deleteExpense: (expenseId: string) => void;
  currentUser: User;
}

const Expenses: React.FC<ExpensesProps> = ({ expenses, travelers, addExpense, editExpense, deleteExpense, currentUser }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expenseToEdit, setExpenseToEdit] = useState<Expense | null>(null);
  const [expenseToDelete, setExpenseToDelete] = useState<Expense | null>(null);
  const [viewingReceiptUrl, setViewingReceiptUrl] = useState<string | null>(null);

  const getPayerName = useCallback((payerId: string) => {
    return travelers.find(t => t.id === payerId)?.name || 'Unknown';
  }, [travelers]);
  
  const sortedExpenses = [...expenses].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const handleOpenAddModal = () => {
    setExpenseToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (expense: Expense) => {
    setExpenseToEdit(expense);
    setIsModalOpen(true);
  };

  const handleSaveExpense = (expenseData: Omit<Expense, 'id'> | Expense) => {
    if ('id' in expenseData) { // It's an existing expense
        editExpense(expenseData);
    } else { // It's a new one
        addExpense(expenseData);
    }
  };

  const handleDeleteConfirm = () => {
    if (expenseToDelete) {
        deleteExpense(expenseToDelete.id);
        setExpenseToDelete(null);
    }
  };

  return (
    <div className="p-4 md:p-8">
        <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">All Expenses</h1>
            <button
            onClick={handleOpenAddModal}
            className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg shadow-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
            Add Expense
            </button>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                {sortedExpenses.map(expense => (
                <li key={expense.id} className="p-4 flex justify-between items-center hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <div className="flex items-center gap-4 flex-1">
                        {expense.receiptImageUrl && (
                            <img 
                                src={expense.receiptImageUrl} 
                                alt="Receipt thumbnail"
                                className="w-12 h-12 object-cover rounded-md cursor-pointer"
                                onClick={() => setViewingReceiptUrl(expense.receiptImageUrl!)}
                             />
                        )}
                        <div className="flex-1">
                            <p className="text-lg font-semibold text-gray-800 dark:text-white">{expense.name}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Paid by {getPayerName(expense.payerId)} on {new Date(expense.date).toLocaleDateString()}
                            </p>
                            <span className="mt-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200">
                                {expense.category}
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 ml-4">
                        <p className="text-xl font-bold text-gray-900 dark:text-white">${expense.amount.toFixed(2)}</p>
                        <div className="flex gap-2">
                             <button onClick={() => handleOpenEditModal(expense)} className="p-2 text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-300" title="Edit">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" /></svg>
                            </button>
                             <button onClick={() => setExpenseToDelete(expense)} className="p-2 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400" title="Delete">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                            </button>
                        </div>
                    </div>
                </li>
                ))}
            </ul>
            {expenses.length === 0 && <p className="text-center p-8 text-gray-500 dark:text-gray-400">No expenses logged yet.</p>}
        </div>

        <ExpenseModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSave={handleSaveExpense}
            travelers={travelers}
            expenseToEdit={expenseToEdit}
            currentUser={currentUser}
        />

        <DeleteConfirmationModal 
            isOpen={!!expenseToDelete}
            onClose={() => setExpenseToDelete(null)}
            onConfirm={handleDeleteConfirm}
            expenseName={expenseToDelete?.name || ''}
        />

        <ReceiptViewerModal 
            imageUrl={viewingReceiptUrl}
            onClose={() => setViewingReceiptUrl(null)}
        />
    </div>
  );
};

export default Expenses;