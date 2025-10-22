'use client';

// Custom imports
import { NavigatingContext } from 'context/Navigation';
import { useRouter } from 'next/navigation';
import { useContext } from 'react';

/**
 * Hook to access the global navigation state
 * Useful for showing or hiding loading spinners
 * 
 * @returns Object with navigating state and setNavigating function
 */
export function useNavigating() {
  return useContext(NavigatingContext);
}

/**
 * Custom hook for prefetching routes in Next.js App Router
 * This tries to prefetch a route before navigating to it
 * for a smoother user experience
 * 
 * @returns Object with navigate function for prefetch navigation
 */
export function usePrefetchRouter() {
  const router = useRouter();
  const { setNavigating } = useNavigating();

  /**
   * Navigate to a route with prefetching
   * Sets navigating state, prefetches the route, then navigates
   */
  const navigate = async (href: string) => {
    try {
      // Show loading spinner
      setNavigating(true);
      
      // Try to prefetch the route for faster loading
      await router.prefetch(href);
    } catch (err) {
      // Prefetch might fail, but that's okay
      // We'll still navigate even if prefetch fails
      console.warn(`Prefetch failed for ${href}`, err);
    }
    
    // Actually navigate to the route
    router.push(href);
  };

  return { navigate };
}