import React, { useState, useEffect } from 'react';
import { User, Trip, Category, CategoryBudget } from '../types';

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

interface SettingsProps {
  currentUser: User;
  currentTrip: Trip;
  updateUser: (newName: string, newAvatarUrl?: string) => Promise<void>;
  updateTrip: (updatedTrip: Trip) => void;
}

const Settings: React.FC<SettingsProps> = ({ currentUser, currentTrip, updateUser, updateTrip }) => {
  const [userName, setUserName] = useState(currentUser.name);
  const [avatarPreview, setAvatarPreview] = useState<string | undefined>(currentUser.avatarUrl);
  const [newAvatarFile, setNewAvatarFile] = useState<string | undefined>(undefined);

  const [categoryBudgets, setCategoryBudgets] = useState<Partial<Record<Category, string>>>(() => {
    const initialBudgets: Partial<Record<Category, string>> = {};
    for (const cat in currentTrip.categoryBudget) {
        initialBudgets[cat as Category] = String(currentTrip.categoryBudget[cat as Category] || '');
    }
    return initialBudgets;
  });
  const [startDate, setStartDate] = useState(currentTrip.startDate || '');
  const [endDate, setEndDate] = useState(currentTrip.endDate || '');


  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingTrip, setIsSavingTrip] = useState(false);
  const [profileMessage, setProfileMessage] = useState({ text: '', isError: false });
  const [tripSettingsMessage, setTripSettingsMessage] = useState({ text: '', isError: false });
  
  // Reset message after a few seconds
  useEffect(() => {
    if (profileMessage.text) {
      const timer = setTimeout(() => setProfileMessage({ text: '', isError: false }), 3000);
      return () => clearTimeout(timer);
    }
  }, [profileMessage]);

  useEffect(() => {
    if (tripSettingsMessage.text) {
      const timer = setTimeout(() => setTripSettingsMessage({ text: '', isError: false }), 3000);
      return () => clearTimeout(timer);
    }
  }, [tripSettingsMessage]);
  
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        const base64 = await fileToBase64(file);
        setNewAvatarFile(base64);
        setAvatarPreview(base64);
    }
  }


  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim()) return;
    setIsSavingProfile(true);
    setProfileMessage({ text: '', isError: false });
    try {
      await updateUser(userName.trim(), newAvatarFile);
      setProfileMessage({ text: 'Profile updated successfully!', isError: false });
      setNewAvatarFile(undefined); // Reset after saving
    } catch (error) {
      setProfileMessage({ text: 'Error updating profile.', isError: true });
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleBudgetChange = (category: Category, value: string) => {
    setCategoryBudgets(prev => ({...prev, [category]: value}));
  };

  const handleTripSettingsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingTrip(true);
    setTripSettingsMessage({ text: '', isError: false });

    // Date validation
    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
        setTripSettingsMessage({ text: 'End date cannot be before start date.', isError: true });
        setIsSavingTrip(false);
        return;
    }

    const newCategoryBudget: CategoryBudget = {};
    let hasError = false;
    for (const cat in categoryBudgets) {
        const value = categoryBudgets[cat as Category];
        if(value && value.trim() !== '') {
            const numValue = parseFloat(value);
            if(isNaN(numValue) || numValue < 0) {
                setTripSettingsMessage({ text: `Invalid amount for ${cat}.`, isError: true });
                hasError = true;
                break;
            }
            newCategoryBudget[cat as Category] = numValue;
        }
    }

    if(hasError) {
        setIsSavingTrip(false);
        return;
    }

    const updatedTrip = { ...currentTrip, categoryBudget: newCategoryBudget, startDate, endDate };
    updateTrip(updatedTrip);

    setTimeout(() => { // Simulate save
        setTripSettingsMessage({ text: 'Trip settings updated successfully!', isError: false });
        setIsSavingTrip(false);
    }, 500);
  };

  return (
    <div className="p-4 md:p-8 space-y-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
      
      {/* User Profile Card */}
      <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">User Profile</h2>
        <form onSubmit={handleProfileSubmit} className="space-y-4">
          <div className="flex items-center space-x-4">
            <img src={avatarPreview || `https://i.pravatar.cc/150?u=${encodeURIComponent(currentUser.name)}`} alt="Profile" className="w-16 h-16 rounded-full object-cover" />
            <div>
              <label htmlFor="avatar-upload" className="cursor-pointer text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-200">
                Change Photo
              </label>
              <input id="avatar-upload" type="file" className="hidden" accept="image/*" onChange={handleAvatarChange} />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">PNG, JPG, GIF up to 1MB</p>
            </div>
          </div>
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
            <input
              type="text"
              id="name"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email (Cannot be changed)</label>
            <input
              type="email"
              id="email"
              value={currentUser.id}
              disabled
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 shadow-sm sm:text-sm"
            />
          </div>
          <div className="flex items-center justify-end space-x-4">
            {profileMessage.text && <span className={`text-sm ${profileMessage.isError ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>{profileMessage.text}</span>}
            <button
              type="submit"
              disabled={isSavingProfile || (userName.trim() === currentUser.name && !newAvatarFile)}
              className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg shadow-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isSavingProfile ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </form>
      </div>

      {/* Trip Settings Card */}
      <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Trip Settings</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Set dates and budgets for your trip to "{currentTrip.destination}".</p>
        <form onSubmit={handleTripSettingsSubmit} className="space-y-6">
            <div>
                 <h3 className="text-md font-medium text-gray-800 dark:text-white mb-2">Trip Duration</h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="start-date" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Start Date</label>
                        <input type="date" id="start-date" value={startDate} onChange={e => setStartDate(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"/>
                    </div>
                    <div>
                        <label htmlFor="end-date" className="block text-sm font-medium text-gray-700 dark:text-gray-300">End Date</label>
                        <input type="date" id="end-date" value={endDate} onChange={e => setEndDate(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"/>
                    </div>
                 </div>
            </div>
             <div className="w-full h-px bg-gray-200 dark:bg-gray-700"></div>
             <div>
                <h3 className="text-md font-medium text-gray-800 dark:text-white mb-2">Budget by Category</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.values(Category).map(cat => (
                        <div key={cat}>
                            <label htmlFor={`budget-${cat}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300">{cat}</label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                    <span className="text-gray-500 sm:text-sm">$</span>
                                </div>
                                <input
                                type="number"
                                id={`budget-${cat}`}
                                min="0"
                                step="0.01"
                                value={categoryBudgets[cat] || ''}
                                onChange={(e) => handleBudgetChange(cat, e.target.value)}
                                placeholder="0.00"
                                className="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:border-primary-500 focus:ring-primary-500 sm:text-sm pl-7"
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

          <div className="flex items-center justify-end space-x-4 pt-4">
            {tripSettingsMessage.text && <span className={`text-sm ${tripSettingsMessage.isError ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>{tripSettingsMessage.text}</span>}
            <button
              type="submit"
              disabled={isSavingTrip}
              className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg shadow-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isSavingTrip ? 'Saving...' : 'Save Trip Settings'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Settings;