import { User, Trip, Traveler } from '../types';

// --- DATABASE SIMULATION ---
// In a real app, this would be a remote database. Here we use localStorage.

const DB_KEY = 'tripcost_ai_db';

interface Database {
  users: Record<string, { password: string; name: string; avatarUrl?: string; }>; // email -> {password, name, avatar}
  trips: Record<string, Trip[]>; // email -> Trip[]
}

const getDb = (): Database => {
  try {
    const dbString = localStorage.getItem(DB_KEY);
    return dbString ? JSON.parse(dbString) : { users: {}, trips: {} };
  } catch (e) {
    console.error("Failed to parse DB from localStorage", e);
    return { users: {}, trips: {} };
  }
};

const saveDb = (db: Database) => {
  localStorage.setItem(DB_KEY, JSON.stringify(db));
};

const SESSION_KEY = 'tripcost_ai_session';

// --- AUTHENTICATION API ---

export const signUp = async (name: string, email: string, password: string): Promise<User> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const db = getDb();
  if (db.users[email]) {
    throw new Error("User with this email already exists.");
  }
  const defaultAvatar = `https://i.pravatar.cc/150?u=${encodeURIComponent(name)}`;
  db.users[email] = { password, name, avatarUrl: defaultAvatar };
  const user: User = { id: email, name, avatarUrl: defaultAvatar };

  // Create the user as the first traveler
  const firstTraveler: Traveler = {
    id: user.id, // Use email as the unique traveler ID
    name: user.name,
    avatarUrl: defaultAvatar,
  };
  
  // Seed user with an initial empty trip with them as a traveler
  db.trips[email] = [{
      id: `trip${Date.now()}`,
      destination: 'My First Trip',
      travelers: [firstTraveler],
      expenses: [],
      categoryBudget: {},
      startDate: '',
      endDate: ''
  }];

  saveDb(db);
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  return user;
};

export const logIn = async (email: string, password: string): Promise<User> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const db = getDb();
    const userData = db.users[email];
    if (userData && userData.password === password) {
        const user: User = { id: email, name: userData.name, avatarUrl: userData.avatarUrl };
        localStorage.setItem(SESSION_KEY, JSON.stringify(user));
        return user;
    } else {
        throw new Error("Invalid email or password.");
    }
};

export const logOut = () => {
  localStorage.removeItem(SESSION_KEY);
};

export const getCurrentUser = (): User | null => {
  try {
    const userString = localStorage.getItem(SESSION_KEY);
    return userString ? JSON.parse(userString) : null;
  } catch (e) {
    return null;
  }
};

export const updateUser = async (userId: string, newName: string, newAvatarUrl?: string): Promise<User> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));

    const db = getDb();
    if (!db.users[userId]) {
        throw new Error("User not found.");
    }
    db.users[userId].name = newName;
    if (newAvatarUrl) {
        db.users[userId].avatarUrl = newAvatarUrl;
    }
    
    // Also update the user's traveler name in all their trips
    if(db.trips[userId]) {
        db.trips[userId].forEach(trip => {
            const userAsTraveler = trip.travelers.find(t => t.id === userId);
            if (userAsTraveler) {
                userAsTraveler.name = newName;
                if (newAvatarUrl) {
                    userAsTraveler.avatarUrl = newAvatarUrl;
                }
            }
        });
    }

    saveDb(db);
    
    // Update session storage
    const user: User | null = getCurrentUser();
    if (user && user.id === userId) {
        user.name = newName;
          if (newAvatarUrl) {
            user.avatarUrl = newAvatarUrl;
        }
        localStorage.setItem(SESSION_KEY, JSON.stringify(user));
        return user;
    } else {
       throw new Error("Session mismatch. Please log in again.");
    }
};


// --- DATA API ---

export const getTripsForUser = (userId: string): Trip[] => {
    const db = getDb();
    return db.trips[userId] || [];
};

export const saveTrip = (userId: string, updatedTrip: Trip): void => {
    const db = getDb();
    if (!db.trips[userId]) {
        db.trips[userId] = [];
    }
    const tripIndex = db.trips[userId].findIndex(t => t.id === updatedTrip.id);
    if (tripIndex > -1) {
        db.trips[userId][tripIndex] = updatedTrip;
    } else {
        db.trips[userId].push(updatedTrip);
    }
    saveDb(db);
};