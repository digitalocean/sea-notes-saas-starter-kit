// MUI imports
import React from 'react';
import Button from '@mui/material/Button';

/**
 * Stylized form button for submit actions
 * This provides a consistent look for all form submit buttons
 * throughout the application
 * 
 * We're using MUI's Button component with some custom styling:
 * - Contained variant for better visibility
 * - Full width to match form fields
 * - Large size for better touch targets
 * - No text transformation (keeps original casing)
 */
export default function FormButton({ children }: { children: React.ReactNode }) {
  return (
    <Button 
      type="submit" 
      variant="contained" 
      fullWidth 
      size="large" 
      sx={{ 
        textTransform: 'none' 
      }}
    >
      {children}
    </Button>
  );
}