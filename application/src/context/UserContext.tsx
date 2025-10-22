'use client';

// React imports
import React, { createContext, useState } from 'react';

// Define the shape of our user context
interface UserState {
  user: string | null;
  setUser: (user: string | null) => void;
}

/**
 * Global user context
 * This allows us to store custom user information outside of Auth.js
 * We might use this for additional user preferences or data that isn't
 * part of the authentication system
 */
export const UserContext = createContext<UserState | undefined>(undefined);

/**
 * User context provider
 * Exposes the user's name and a function to update it
 * This is wrapped around our entire app in the Providers component
 */
export function UserProvider({ children }: { children: React.ReactNode }) {
  // Simple state for storing user information
  const [user, setUser] = useState<string | null>(null);
  
  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
}