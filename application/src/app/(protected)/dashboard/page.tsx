import React from 'react';
import { redirect } from 'next/navigation';
import { auth, currentUser } from '@clerk/nextjs/server';
import DashboardPageClient from './DashboardPageClient';

/**
 * Dashboard page - protected route that requires authentication
 */
const DashboardPage: React.FC = async () => {
  const { userId } = await auth();
  
  // If the user is not authenticated, redirect to the auth page
  if (!userId) {
    redirect('/auth');
  }

  // Get user information from Clerk
  const user = await currentUser();
  const userEmail = user?.emailAddresses[0]?.emailAddress || '';
  const userName = user?.firstName || '';

  return <DashboardPageClient userEmail={userEmail} userName={userName} />;
};

export default DashboardPage;