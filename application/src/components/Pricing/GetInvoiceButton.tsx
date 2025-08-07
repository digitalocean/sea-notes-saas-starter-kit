'use client';

import React, { useState } from 'react';
import { Button, Alert, Snackbar, CircularProgress } from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface GetInvoiceButtonProps {
  variant?: 'text' | 'outlined' | 'contained';
  fullWidth?: boolean;
  size?: 'small' | 'medium' | 'large';
  sx?: React.CSSProperties;
}

/**
 * GetInvoiceButton component that allows authenticated users to generate and receive
 * an invoice for their current subscription plan via email.
 */
export default function GetInvoiceButton({ 
  variant = 'contained',
  fullWidth = false,
  size = 'medium',
  sx = {}
}: GetInvoiceButtonProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleGetInvoice = async () => {
    if (status === 'loading') return;

    if (!session) {
      // Redirect to login if not authenticated
      router.push('/login');
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/api/billing/generate-invoice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({
          type: 'success',
          text: data.message || 'Invoice sent successfully!'
        });
      } else {
        setMessage({
          type: 'error',
          text: data.error || 'Failed to generate invoice'
        });
      }
    } catch {
      setMessage({
        type: 'error',
        text: 'Network error. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setMessage(null);
  };

  return (
    <>
      <Button
        variant={variant}
        fullWidth={fullWidth}
        size={size}
        onClick={handleGetInvoice}
        disabled={loading || status === 'loading'}
        startIcon={loading ? <CircularProgress size={20} /> : <EmailIcon />}
        sx={{
          '&:hover': {
            backgroundColor: 'transparent',
            color: 'inherit'
          },
          ...sx
        }}
      >
        {loading ? 'Generating...' : 'Email Invoice'}
      </Button>

      <Snackbar
        open={!!message}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={message?.type} 
          sx={{ width: '100%' }}
        >
          {message?.text}
        </Alert>
      </Snackbar>
    </>
  );
} 