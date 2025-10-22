import React from 'react';
import { redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';

/**
 * My Notes page - protected route that requires authentication
 */
const MyNotesPage: React.FC = async () => {
  const { userId } = await auth();
  
  // If the user is not authenticated, redirect to the auth page
  if (!userId) {
    redirect('/auth');
  }

  return (
    <div style={{ padding: '2rem' }}>
      <h1>My Notes</h1>
      <p>Welcome to your notes! This is where your personal notes will appear.</p>
    </div>
  );
};

export default MyNotesPage;