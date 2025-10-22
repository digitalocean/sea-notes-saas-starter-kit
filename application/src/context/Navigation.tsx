'use client';

// React imports
import { createContext, useState } from 'react';

/**
 * Context for handling global navigation state
 * This allows us to show loading indicators during page transitions
 * or when waiting for API calls to complete
 */
export const NavigatingContext = createContext<{
  navigating: boolean;
  setNavigating: (value: boolean) => void;
}>({ 
  navigating: false, 
  setNavigating: () => {} 
});

/**
 * Navigation context provider
 * Provides the navigating state and a function to update it
 * This is used throughout the app to show loading spinners
 * during navigation or API calls
 */
export function NavigatingProvider({ children }: { children: React.ReactNode }) {
  // State to track if we're currently navigating or loading
  const [navigating, setNavigating] = useState(false);

  return (
    <NavigatingContext.Provider value={{ navigating, setNavigating }}>
      {children}
    </NavigatingContext.Provider>
  );
}