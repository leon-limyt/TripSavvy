import { User, Trip, Traveler } from '../types';

// --- DATABASE SIMULATION ---
// In a real app, this would be a remote database. Here we use localStorage.

const DB_KEY = 'tripcost_ai_db_v2'; // Use a new key for the updated schema

interface Database {
  users: Record<string, { password: string; name: string; avatarUrl?: string; tripIds: string[] }>;
  trips: Record<string, Trip>; // tripId is key
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
  const user: User = { id: email, name, avatarUrl: defaultAvatar };

  db.users[email] = { password, name, avatarUrl: defaultAvatar, tripIds: [] };

  const firstTraveler: Traveler = {
    id: user.id, // Use email as the unique traveler ID
    name: user.name,
    avatarUrl: defaultAvatar,
  };
  
  // Seed user with an initial trip which they own
  const tripId = `trip${Date.now()}`;
  const newTrip: Trip = {
      id: tripId,
      destination: 'My First Trip',
      travelers: [firstTraveler],
      expenses: [],
      categoryBudget: {},
      startDate: '',
      endDate: '',
      ownerId: user.id,
      pendingInvites: []
  };
  db.trips[tripId] = newTrip;
  db.users[email].tripIds.push(tripId);

  // Check if this user was invited to any other trips while they didn't have an account
  Object.values(db.trips).forEach(trip => {
    if (trip.pendingInvites?.includes(email)) {
      trip.travelers.push({
        id: user.id,
        name: user.name,
        avatarUrl: user.avatarUrl
      });
      trip.pendingInvites = trip.pendingInvites.filter(e => e !== email);
      db.users[email].tripIds.push(trip.id);
    }
  });

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
    const userData = db.users[userId];
    if (!userData) {
        throw new Error("User not found.");
    }
    userData.name = newName;
    if (newAvatarUrl) {
        userData.avatarUrl = newAvatarUrl;
    }
    
    // Also update the user's traveler name in all their trips
    userData.tripIds.forEach(tripId => {
        const trip = db.trips[tripId];
        if (trip) {
            const userAsTraveler = trip.travelers.find(t => t.id === userId);
            if (userAsTraveler) {
                userAsTraveler.name = newName;
                if (newAvatarUrl) {
                    userAsTraveler.avatarUrl = newAvatarUrl;
                }
            }
        }
    });

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
    const user = db.users[userId];
    if (!user) return [];
    // Get trips from IDs, filter out any potential nulls if a trip was deleted but ID remained
    return user.tripIds.map(id => db.trips[id]).filter(Boolean);
};

export const saveTrip = async (updatedTrip: Trip): Promise<void> => {
    // Simulate network delay to mimic a real API call
    await new Promise(resolve => setTimeout(resolve, 600));

    const db = getDb();
    if (!db.trips[updatedTrip.id]) {
        console.error("Attempted to save a trip that does not exist:", updatedTrip.id);
        // In a real app, you would throw an error
        throw new Error("Trip not found during save operation.");
    }
    db.trips[updatedTrip.id] = updatedTrip;
    saveDb(db);
};

export const inviteTraveler = async (tripId: string, inviteeEmail: string, inviterId: string): Promise<Trip> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  const db = getDb();
  const trip = db.trips[tripId];
  if (!trip) throw new Error("Trip not found.");
  if (trip.ownerId !== inviterId) throw new Error("Only the trip owner can invite members.");
  if (inviteeEmail === inviterId) throw new Error("You cannot invite yourself.");

  // Check if already a traveler or already invited
  const isAlreadyTraveler = trip.travelers.some(t => t.id === inviteeEmail);
  const isAlreadyInvited = trip.pendingInvites?.includes(inviteeEmail);
  if (isAlreadyTraveler || isAlreadyInvited) {
      throw new Error("This user is already part of the trip or has a pending invitation.");
  }

  const inviteeUser = db.users[inviteeEmail];

  if (inviteeUser) {
      // User exists, add them directly to travelers and update their trip list
      inviteeUser.tripIds.push(tripId);
      trip.travelers.push({
          id: inviteeEmail,
          name: inviteeUser.name,
          avatarUrl: inviteeUser.avatarUrl || `https://i.pravatar.cc/150?u=${encodeURIComponent(inviteeUser.name)}`
      });
  } else {
      // User doesn't exist, add to pending invites
      if (!trip.pendingInvites) {
          trip.pendingInvites = [];
      }
      trip.pendingInvites.push(inviteeEmail);
  }

  db.trips[tripId] = trip;
  saveDb(db);
  return trip;
};