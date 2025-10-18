import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import Expenses from './components/Expenses';
import Planner from './components/Planner';
import ThemeToggle from './components/ThemeToggle';
import TripIcon from './components/icons/TripIcon';
import ExpenseIcon from './components/icons/ExpenseIcon';
import PlannerIcon from './components/icons/PlannerIcon';
import SettingsIcon from './components/icons/SettingsIcon';
import Settings from './components/Settings';
import { Expense, User, Trip } from './types';
import * as storageService from './services/storageService';
import PaperAirplaneIcon from './components/icons/PaperAirplaneIcon';

type View = 'dashboard' | 'expenses' | 'planner' | 'settings';
type AuthView = 'login' | 'signup';


const AuthComponent: React.FC<{ onAuthSuccess: (user: User) => void }> = ({ onAuthSuccess }) => {
    const [authView, setAuthView] = useState<AuthView>('login');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            let user;
            if (authView === 'signup') {
                user = await storageService.signUp(name, email, password);
            } else {
                user = await storageService.logIn(email, password);
            }
            onAuthSuccess(user);
        } catch (err: any) {
            setError(err.message || 'An error occurred.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cyan-400 to-orange-300 dark:from-cyan-800 dark:to-orange-600 p-4">
            <div className="max-w-md w-full mx-auto p-8 bg-white/20 dark:bg-gray-900/30 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/30">
                <div className="flex justify-center mb-6">
                    <div className="w-20 h-20 bg-white/30 rounded-full flex items-center justify-center border border-white/40">
                         <PaperAirplaneIcon className="w-10 h-10 text-white" />
                    </div>
                </div>
                <h2 className="text-4xl font-bold text-center text-white mb-8">
                    Welcome to TripSavvy
                </h2>

                <div className="flex border-b border-white/30 mb-6">
                    <button onClick={() => setAuthView('login')} className={`flex-1 py-2 text-sm font-medium transition-colors duration-300 ${authView === 'login' ? 'border-b-2 border-white text-white' : 'text-white/70 hover:text-white'}`}>
                        Sign In
                    </button>
                    <button onClick={() => setAuthView('signup')} className={`flex-1 py-2 text-sm font-medium transition-colors duration-300 ${authView === 'signup' ? 'border-b-2 border-white text-white' : 'text-white/70 hover:text-white'}`}>
                        Get Started
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {authView === 'signup' && (
                         <div>
                            <label htmlFor="name" className="block text-sm font-medium text-white/90">Name</label>
                            <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} required className="mt-1 block w-full rounded-md border-white/40 bg-white/20 text-white placeholder-white/60 shadow-sm focus:border-white focus:ring-white sm:text-sm"/>
                        </div>
                    )}
                     <div>
                        <label htmlFor="email" className="block text-sm font-medium text-white/90">Email Address</label>
                        <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="mt-1 block w-full rounded-md border-white/40 bg-white/20 text-white placeholder-white/60 shadow-sm focus:border-white focus:ring-white sm:text-sm"/>
                    </div>
                     <div>
                        <label htmlFor="password"className="block text-sm font-medium text-white/90">Password</label>
                        <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="mt-1 block w-full rounded-md border-white/40 bg-white/20 text-white placeholder-white/60 shadow-sm focus:border-white focus:ring-white sm:text-sm"/>
                    </div>
                    {error && <p className="text-sm text-yellow-300 text-center">{error}</p>}
                    <button type="submit" disabled={isLoading} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-cyan-700 bg-white hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-cyan-500 focus:ring-white disabled:bg-gray-200 transition-colors duration-300">
                        {isLoading ? 'Processing...' : (authView === 'login' ? 'Sign In' : 'Create Account')}
                    </button>
                </form>
            </div>
        </div>
    );
};


const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentTrip, setCurrentTrip] = useState<Trip | null>(null);
  const [view, setView] = useState<View>('dashboard');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Theme setup
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    setIsDarkMode(prefersDark);
    if (prefersDark) {
      document.documentElement.classList.add('dark');
    }

    // Auth check
    const user = storageService.getCurrentUser();
    if (user) {
        handleAuthSuccess(user);
    } else {
        setIsLoading(false);
    }
  }, []);

  const handleAuthSuccess = (user: User) => {
    setCurrentUser(user);
    const trips = storageService.getTripsForUser(user.id);
    // For now, just load the first trip. A real app would have a trip selector.
    if (trips.length > 0) {
      // sort by owner first
      trips.sort((a,b) => (a.ownerId === user.id ? -1 : 1));
      setCurrentTrip(trips[0]);
    } else {
      // This case should be rare now since signup creates a trip
      setCurrentTrip(null);
    }
    setIsLoading(false);
  };

  const handleLogout = () => {
    storageService.logOut();
    setCurrentUser(null);
    setCurrentTrip(null);
  };
  
  const updateUser = async (newName: string, newAvatarUrl?: string) => {
    if (!currentUser) return;
    try {
        const updatedUser = await storageService.updateUser(currentUser.id, newName, newAvatarUrl);
        setCurrentUser(updatedUser);
        
        // Also refresh trip data in case traveler name was updated
        const trips = storageService.getTripsForUser(updatedUser.id);
        if (trips.length > 0 && currentTrip) {
            // Find the currently selected trip from the refreshed list
            const refreshedTrip = trips.find(t => t.id === currentTrip.id);
            setCurrentTrip(refreshedTrip || trips[0]);
        }
    } catch (error) {
        console.error("Failed to update user:", error);
        throw error; // re-throw for the component to handle
    }
  };

  const updateTrip = (updatedTrip: Trip) => {
      if (!currentUser) return;
      setCurrentTrip(updatedTrip);
      storageService.saveTrip(updatedTrip);
  };
  
  const handleInviteTraveler = async (email: string) => {
      if (!currentTrip || !currentUser) return;
      const updatedTrip = await storageService.inviteTraveler(currentTrip.id, email, currentUser.id);
      setCurrentTrip(updatedTrip);
  }
  
  const addExpense = (newExpenseData: Omit<Expense, 'id'>) => {
    if (!currentTrip || !currentUser) return;
    
    const completeExpense: Expense = {
        ...newExpenseData,
        id: `exp${Date.now()}`,
    };

    const updatedTrip = {
        ...currentTrip,
        expenses: [...currentTrip.expenses, completeExpense]
    };
    
    updateTrip(updatedTrip);
  };
  
  const editExpense = (updatedExpense: Expense) => {
    if (!currentTrip) return;
    
    const updatedExpenses = currentTrip.expenses.map(exp => 
        exp.id === updatedExpense.id ? updatedExpense : exp
    );

    const updatedTrip = {
        ...currentTrip,
        expenses: updatedExpenses,
    };
    
    updateTrip(updatedTrip);
  };

  const deleteExpense = (expenseId: string) => {
    if (!currentTrip) return;

    const updatedExpenses = currentTrip.expenses.filter(exp => exp.id !== expenseId);

     const updatedTrip = {
        ...currentTrip,
        expenses: updatedExpenses,
    };
    
    updateTrip(updatedTrip);
  };


  const renderView = () => {
    if (!currentTrip || !currentUser) return (
        <div className="text-center p-8 text-gray-500 dark:text-gray-400">
            {currentUser ? 'Loading trip data or create your first trip...' : 'Please log in.'}
        </div>
    );

    switch (view) {
      case 'dashboard':
        return <Dashboard trip={currentTrip} currentUser={currentUser} updateTrip={updateTrip} handleInviteTraveler={handleInviteTraveler} />;
      case 'expenses':
        return <Expenses 
                    expenses={currentTrip.expenses} 
                    travelers={currentTrip.travelers} 
                    addExpense={addExpense}
                    editExpense={editExpense}
                    deleteExpense={deleteExpense}
                    currentUser={currentUser}
                />;
      case 'planner':
        return <Planner destination={currentTrip.destination}/>;
      case 'settings':
        return <Settings currentUser={currentUser} currentTrip={currentTrip} updateUser={updateUser} updateTrip={updateTrip} />;
      default:
        return <Dashboard trip={currentTrip} currentUser={currentUser} updateTrip={updateTrip} handleInviteTraveler={handleInviteTraveler} />;
    }
  };
  
  const NavItem: React.FC<{
      targetView: View;
      icon: React.ReactNode;
      label: string;
    }> = ({ targetView, icon, label }) => {
    const isActive = view === targetView;
    return (
        <button
          onClick={() => setView(targetView)}
          className={`flex-1 flex flex-col items-center justify-center p-2 space-y-1 rounded-md transition-colors duration-200 ${
            isActive ? 'bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-300' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
        >
          {icon}
          <span className="text-xs font-medium">{label}</span>
        </button>
    );
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">Loading...</div>;
  }
  
  if (!currentUser) {
      return <AuthComponent onAuthSuccess={handleAuthSuccess} />;
  }

  return (
    <div className="min-h-screen text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-2">
              <PaperAirplaneIcon className="w-8 h-8 text-primary-600 dark:text-primary-400" />
              <div className="flex flex-col">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">TripSavvy</h1>
                {currentTrip && <p className="text-sm text-gray-500 dark:text-gray-400">Your trip to {currentTrip.destination}</p>}
              </div>
            </div>
             <div className="hidden md:flex items-center space-x-2">
                <NavItem targetView="dashboard" icon={<TripIcon className="w-6 h-6"/>} label="Overview" />
                <NavItem targetView="expenses" icon={<ExpenseIcon className="w-6 h-6"/>} label="Expenses" />
                <NavItem targetView="planner" icon={<PlannerIcon className="w-6 h-6"/>} label="AI Planner" />
                <NavItem targetView="settings" icon={<SettingsIcon className="w-6 h-6"/>} label="Settings" />
             </div>
             <div className="flex items-center space-x-4">
                <div className="text-right hidden sm:block">
                    <p className="text-sm font-medium">Hi, {currentUser.name}</p>
                </div>
                {currentUser.avatarUrl && (
                    <img src={currentUser.avatarUrl} alt={currentUser.name} className="w-10 h-10 rounded-full object-cover" />
                )}
                <button onClick={handleLogout} className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none" title="Logout">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                    </svg>
                </button>
                <ThemeToggle isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />
             </div>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto">
        {renderView()}
      </main>

       {/* Mobile Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 shadow-t-md p-2 flex justify-around border-t border-gray-200 dark:border-gray-700">
        <NavItem targetView="dashboard" icon={<TripIcon className="w-6 h-6"/>} label="Overview" />
        <NavItem targetView="expenses" icon={<ExpenseIcon className="w-6 h-6"/>} label="Expenses" />
        <NavItem targetView="planner" icon={<PlannerIcon className="w-6 h-6"/>} label="Planner" />
        <NavItem targetView="settings" icon={<SettingsIcon className="w-6 h-6"/>} label="Settings" />
      </nav>
      <div className="md:hidden h-20"></div> {/* Spacer for mobile nav */}
    </div>
  );
};

export default App;
