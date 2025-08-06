'use client';

import React from 'react';
import { useEffect, useState, useCallback, useMemo } from 'react';
import { StripeClient } from 'lib/api/stripe';
import { SubscriptionPlan, SubscriptionPlanEnum } from 'types';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import { Link as MuiLink } from '@mui/material';
import Link from 'next/link';
import GetInvoiceButton from 'components/Pricing/GetInvoiceButton';
import DownloadInvoiceButton from './DownloadInvoiceButton';

/**
 * Main component for managing user subscriptions.
 *
 * @returns Subscription component that displays the user's subscription status and allows them to manage their subscription.
 */
const Subscription: React.FC = () => {
  const [subscription, setSubscription] = useState<{
    id: string | null;
    status: string | null;
    plan: SubscriptionPlan | null;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [upgrading, setUpgrading] = useState(false);
  const stripeApi = useMemo(() => new StripeClient(), []);

  const fetchSubscription = useCallback(async () => {
    try {
      const { subscription } = await stripeApi.getSubscription();
      setSubscription(subscription[0]);
    } catch {
      setError('Error loading subscription');
    } finally {
      setLoading(false);
    }
  }, [stripeApi]);

  const handleCancel = async () => {
    setLoading(true);
    try {
      await stripeApi.cancelSubscription();
      await fetchSubscription();
    } catch {
      setError('Failed to cancel subscription');
    } finally {
      setLoading(false);
    }
  };

  const handleUpgradeToPro = async () => {
    setUpgrading(true);
    try {
      const result = await stripeApi.checkout();
      window.location.href = result.url;
    } catch (error) {
      // Handle specific error cases
      if (error instanceof Error) {
        if (error.message.includes('already on the')) {
          setError('You are already on the PRO plan');
        } else {
          setError('Upgrade failed');
        }
      } else {
        setError('Upgrade failed');
      }
    } finally {
      setUpgrading(false);
    }
  };

  useEffect(() => {
    fetchSubscription();
  }, [fetchSubscription]);

  const currentPlan = subscription?.plan;

  const isBasePlan = currentPlan === SubscriptionPlanEnum.FREE;
  const isProPlan = currentPlan === SubscriptionPlanEnum.PRO;

  if (loading)
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
        <CircularProgress />
      </Box>
    );
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box p={4}>
      <Typography variant="h4" fontWeight="bold" mb={3}>
        Subscription
      </Typography>

      {subscription ? (
        <Typography mb={2}>
          Subscription status: <strong>{subscription.status}</strong> (
          {isProPlan
            ? `${SubscriptionPlanEnum.PRO} Plan`
            : isBasePlan
              ? `${SubscriptionPlanEnum.FREE} Plan`
              : 'No Plan'}
          )
        </Typography>
      ) : null}

      {subscription?.plan && subscription?.status ? (
        <Box display="flex" flexDirection="column" alignItems="flex-start">
          {isBasePlan && (
            <Button
              onClick={handleUpgradeToPro}
              disabled={upgrading}
              variant="contained"
              color="primary"
              sx={{ mt: 2, minWidth: 200 }}
            >
              {upgrading ? 'Upgrading...' : `Upgrade to ${SubscriptionPlanEnum.PRO}`}
            </Button>
          )}

          {isProPlan && (
            <Button
              onClick={handleCancel}
              disabled={loading}
              variant="contained"
              color="error"
              sx={{ mt: 2, minWidth: 200 }}
            >
              Cancel Subscription
            </Button>
          )}

          {/* Invoice Section */}
          <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid #e0e0e0', width: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Invoice Management
            </Typography>
            
            {/* Email Invoice Option */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Have your latest invoice emailed to you:
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start', mt: 0.25 }}>
                <GetInvoiceButton 
                  variant="outlined"
                  size="medium"
                />
                <DownloadInvoiceButton 
                  variant="outlined"
                  size="medium"
                />
              </Box>
            </Box>

            <Box sx={{ mt: 2, p: 2, bgcolor: '#f5f7fa', borderRadius: 2, border: '1px solid #e0e0e0' }}>
              <Typography variant="body2" color="text.secondary">
              <strong>Note for developers:</strong> Invoice details (plan, amount, etc.) are fetched live from Stripe, and a professional invoice is generated and sent to the user via email and can also be downloaded.
              </Typography>
            </Box>
          </Box>
        </Box>
      ) : (
        <Box display={'flex'} flexDirection="column" alignItems="flex-start" mt={2}>
          <Typography variant="body1" mb={2}>
            You currently do not have an active subscription. Your account most likely was created
            without Stripe being configured.
          </Typography>
          <Typography variant="body1" mb={2}>
            If you configured Stripe, new accounts will automatically be created with the{' '}
            {SubscriptionPlanEnum.FREE} Plan.
          </Typography>
          <Typography variant="body1" mb={2}>
            Billing configuration status can be checked in the{' '}
            <MuiLink
              component={Link}
              href="/system-status"
              variant="body1"
              color="primary"
              sx={{ textDecoration: 'underline' }}
            >
              system status
            </MuiLink>{' '}
            page.
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default Subscription;
