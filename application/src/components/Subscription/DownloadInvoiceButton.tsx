'use client';

import React, { useState } from 'react';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import DownloadIcon from '@mui/icons-material/Download';
import Alert from '@mui/material/Alert';

interface InvoiceResponse {
  success: boolean;
  invoiceNumber?: string;
  planName?: string;
  amount?: number;
  message?: string;
  error?: string;
}

interface DownloadResponse {
  success: boolean;
  invoiceUrl?: string;
  invoiceNumber?: string;
  expiresAt?: string;
  error?: string;
}

interface DownloadInvoiceButtonProps {
  variant?: 'text' | 'outlined' | 'contained';
  size?: 'small' | 'medium' | 'large';
  color?: 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';
}

/**
 * Simple button component for downloading invoices
 */
const DownloadInvoiceButton: React.FC<DownloadInvoiceButtonProps> = ({
  variant = 'outlined',
  size = 'medium',
  color = 'primary'
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDownload = async () => {
    setLoading(true);
    setError(null);

    try {
      // Step 1: Generate invoice
      const generateResponse = await fetch('/api/billing/generate-invoice-storage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const generateData: InvoiceResponse = await generateResponse.json();

      if (!generateResponse.ok) {
        throw new Error(generateData.error || 'Failed to generate invoice');
      }

      if (!generateData.success || !generateData.invoiceNumber) {
        throw new Error('Invalid response from invoice generation');
      }

      // Step 2: Get download URL
      const downloadResponse = await fetch(`/api/billing/download-invoice/${generateData.invoiceNumber}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const downloadData: DownloadResponse = await downloadResponse.json();

      if (!downloadResponse.ok) {
        throw new Error(downloadData.error || 'Failed to get download URL');
      }

      if (!downloadData.success || !downloadData.invoiceUrl) {
        throw new Error('Invalid response from download service');
      }

      // Step 3: Trigger download
      const link = document.createElement('a');
      link.href = downloadData.invoiceUrl;
      link.download = `invoice-${generateData.invoiceNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to download invoice');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <Button
        onClick={handleDownload}
        disabled={loading}
        variant={variant}
        size={size}
        color={color}
        startIcon={loading ? <CircularProgress size={20} /> : <DownloadIcon />}
        sx={{
          '&:hover': {
            backgroundColor: 'transparent',
            color: 'inherit'
          }
        }}
      >
        {loading ? 'Generating...' : 'Download Invoice'}
      </Button>
    </>
  );
};

export default DownloadInvoiceButton; 