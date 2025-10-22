import React from 'react';
import { redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';

/**
 * Account page - protected route that requires authentication
 */
const AccountPage: React.FC = async () => {
  const { userId } = await auth();
  
  // If the user is not authenticated, redirect to the auth page
  if (!userId) {
    redirect('/auth');
  }

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Account Settings</h1>
      <p>Manage your account settings and preferences.</p>
    </div>
  );
};

export default AccountPage;