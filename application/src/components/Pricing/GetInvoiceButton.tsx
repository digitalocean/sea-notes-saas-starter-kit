'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Button, Alert, Snackbar, CircularProgress } from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface GetInvoiceButtonProps {
  variant?: 'text' | 'outlined' | 'contained';
  fullWidth?: boolean;
  size?: 'small' | 'medium' | 'large';
  sx?: Record<string, unknown>;
}

/**
 * GetInvoiceButton component that allows authenticated users to generate and receive
 * an invoice for their current subscription plan via email.
 *
 * Added: a small on-click transition effect (scale + lift + shadow).
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

  // transient "clicked" state used to trigger a short transform/box-shadow
  const [clicked, setClicked] = useState(false);
  const clickTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    // cleanup timeout on unmount
    return () => {
      if (clickTimeoutRef.current) {
        window.clearTimeout(clickTimeoutRef.current);
        clickTimeoutRef.current = null;
      }
    };
  }, []);

  const triggerClickAnimation = (duration = 220) => {
    // set clicked to true briefly to animate
    setClicked(true);
    if (clickTimeoutRef.current) {
      window.clearTimeout(clickTimeoutRef.current);
    }
    clickTimeoutRef.current = window.setTimeout(() => {
      setClicked(false);
      clickTimeoutRef.current = null;
    }, duration);
  };

  const handleGetInvoice = async () => {
    // If session status is still loading, don't proceed
    if (status === 'loading') return;

    // If not logged in, redirect to login
    if (!session) {
      router.push('/login');
      return;
    }

    // trigger immediate click animation for snappy feedback
    triggerClickAnimation();

    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/api/billing/generate-invoice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Attempt to parse JSON safely
      let data: any = {};
      try {
        data = await response.json();
      } catch {
        data = {};
      }

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
      // ensure animation doesn't get stuck if loading finishes faster/slower
      if (clickTimeoutRef.current) {
        // keep existing timeout to finish naturally
      } else {
        // if no timeout running, ensure clicked is cleared
        setClicked(false);
      }
    }
  };

  const handleCloseSnackbar = () => {
    setMessage(null);
  };

  // Compose animation-friendly sx; user-provided sx merges in (user sx can override)
  const animationSx: Record<string, unknown> = {
    mt: 2,
    transform: clicked ? 'translateY(-3px) scale(1.02)' : 'translateY(0) scale(1)',
    boxShadow: clicked ? '0 10px 24px rgba(3, 18, 26, 0.12)' : '0 6px 18px rgba(3, 18, 26, 0.08)',
    transition: 'transform 180ms cubic-bezier(.2,.9,.2,1), box-shadow 180ms cubic-bezier(.2,.9,.2,1)',
    '&:hover': {
      // keep a subtle hover effect when not loading
      transform: clicked ? 'translateY(-3px) scale(1.02)' : 'translateY(-2px) scale(1.01)',
      color: 'inherit'
    },
    // ensure focus/active look good for keyboard users
    '&:active': {
      transform: 'translateY(0) scale(0.99)'
    },
    // allow consumer to override anything via sx prop
    ...sx
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
        aria-busy={loading}
        sx={animationSx}
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
