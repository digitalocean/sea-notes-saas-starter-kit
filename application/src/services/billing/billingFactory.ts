import { serverConfig } from '../../settings';
import { BillingService } from './billing';

/**
 * Factory function to create and return the appropriate billing client based on the configured provider.
 */
export async function createBillingService(): Promise<BillingService> {
  const billingProvider = serverConfig.billingProvider;

  switch (billingProvider) {
    // Add more providers here in the future
    // case 'PayPal':
    //   return new PaypalBillingService();
    case 'Stripe':
    default: {
      const { StripeBillingService } = await import('./stripeBillingService');
      return new StripeBillingService();
    }
  }
}
