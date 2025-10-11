import { serverConfig } from '../../settings';
import { ServiceConfigStatus } from 'services/status/serviceConfigStatus';
import { BillingService } from './billing';
import Stripe from 'stripe';
import { SubscriptionPlan } from 'types';

/**
 * StripeBillingService is a service that implements the BillingService interface
 * using the Stripe API for managing billing operations such as customers and subscriptions.
 */
export class StripeBillingService extends BillingService {
  private stripe: Stripe | null = null;
  private static readonly serviceName = 'Billing (Stripe)';
  private isConfigured: boolean = false;
  private description: string = 'The following features are impacted: signup, billing plans';

  // Required config items with their corresponding env var names and descriptions
  private static requiredConfig = {
    stripeSecretKey: { envVar: 'STRIPE_SECRET_KEY', description: 'Stripe secret key' },
    freePriceId: { envVar: 'STRIPE_FREE_PRICE_ID', description: 'Free price id' },
    proPriceId: { envVar: 'STRIPE_PRO_PRICE_ID', description: 'Pro price id' },
    proGiftPriceId: { envVar: 'STRIPE_PRO_GIFT_PRICE_ID', description: 'Pro (Gift) id' },
    webhookSecret: {
      envVar: 'STRIPE_WEBHOOK_SECRET',
      description: 'Secret to authenticate stripe webhooks',
    },
    portalConfigId: { envVar: 'STRIPE_PORTAL_CONFIG_ID', description: 'Checkout portal id' },
  };
  private lastConnectionError: string = '';

  constructor() {
    super();
    this.initialize();
  }

  private initialize() {
    const missingConfig = this.validateMissingSettings();

    if (missingConfig.length > 0) {
      this.isConfigured = false;
      return;
    }

    this.stripe = new Stripe(serverConfig.Stripe.stripeSecretKey!, {
      apiVersion: '2025-08-27.basil',
    });
  }

  private validateMissingSettings() {
    const missingConfig = Object.entries(StripeBillingService.requiredConfig)
      .filter(([key]) => !serverConfig.Stripe[key as keyof typeof serverConfig.Stripe])
      .map(([, value]) => value.envVar);

    if (!serverConfig.baseURL) {
      missingConfig.push('BASE_URL');
    }

    return missingConfig;
  }

  private getPriceId(plan: SubscriptionPlan | 'GIFT'): string {
    const priceIdMap: Record<SubscriptionPlan | 'GIFT', string | undefined> = {
      FREE: serverConfig.Stripe.freePriceId,
      PRO: serverConfig.Stripe.proPriceId,
      GIFT: serverConfig.Stripe.proGiftPriceId,
    };

    const priceId = priceIdMap[plan];
    if (!priceId) {
      throw new Error(`${plan} price ID is not configured`);
    }
    return priceId;
  }

  async listCustomer(email: string) {
    if (!this.stripe) {
      throw new Error('Stripe client not initialized. Check Configuration');
    }

    const result = await this.stripe.customers.list({
      email: email,
      limit: 1,
    });

    return result.data.map((customer) => ({ id: customer.id }));
  }

  async createCustomer(email: string, metadata?: Record<string, string>) {
    if (!this.stripe) {
      throw new Error('Stripe client not initialized. Check Configuration');
    }

    return await this.stripe.customers.create({
      email: email,
      metadata: metadata,
    });
  }

  async createSubscription(customerId: string, plan: SubscriptionPlan) {
    if (!this.stripe) {
      throw new Error('Stripe client not initialized. Check Configuration');
    }

    const priceId = this.getPriceId(plan);

    const result = await this.stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      payment_behavior: 'default_incomplete',
      payment_settings: {
        save_default_payment_method: 'on_subscription',
      },
    });

    if (
      result.latest_invoice &&
      typeof result.latest_invoice !== 'string' &&
      'payment_intent' in result.latest_invoice &&
      result.latest_invoice.payment_intent &&
      typeof result.latest_invoice.payment_intent !== 'string'
    ) {
      return {
        clientSecret:
          (result.latest_invoice.payment_intent as Stripe.PaymentIntent).client_secret ?? undefined,
        id: result.id,
      };
    }

    return {
      clientSecret: undefined,
      id: result.id,
    };
  }

  async listSubscription(customerId: string) {
    if (!this.stripe) {
      throw new Error('Stripe client not initialized. Check Configuration');
    }

    const result = await this.stripe.subscriptions.list({
      customer: customerId,
      limit: 1,
    });

    return result.data.map((subscription) => ({
      id: subscription.id,
      status: subscription.status,
      items: subscription.items.data.map((item) => ({ id: item.id, priceId: item.price.id })),
    }));
  }

  async cancelSubscription(subscriptionId: string) {
    if (!this.stripe) {
      throw new Error('Stripe client not initialized. Check Configuration');
    }

    await this.stripe.subscriptions.cancel(subscriptionId);
  }

  async updateSubscription(id: string, itemId: string, plan: SubscriptionPlan | 'GIFT') {
    if (!this.stripe) {
      throw new Error('Stripe client not initialized. Check Configuration');
    }

    const priceId = this.getPriceId(plan);

    const result = await this.stripe.subscriptions.update(id, {
      items: [
        {
          id: itemId,
          price: priceId,
        },
      ],
      proration_behavior: 'always_invoice',
      payment_behavior: 'default_incomplete',
    });

    if (
      result.latest_invoice &&
      typeof result.latest_invoice !== 'string' &&
      'payment_intent' in result.latest_invoice &&
      result.latest_invoice.payment_intent &&
      typeof result.latest_invoice.payment_intent !== 'string'
    ) {
      return {
        clientSecret:
          (result.latest_invoice.payment_intent as Stripe.PaymentIntent).client_secret ?? undefined,
      };
    }

    return {
      clientSecret: undefined,
    };
  }

  async manageSubscription(plan: SubscriptionPlan, customerId: string) {
    if (!this.stripe) {
      throw new Error('Stripe client not initialized. Check Configuration');
    }

    const result = await this.stripe.subscriptions.list({
      customer: customerId,
      limit: 1,
    });

    if (result.data.length === 0) {
      throw new Error('No subscription found for customer');
    }

    const subscription = result.data[0];
    const currentPriceId = subscription.items.data[0]?.price.id;
    const requestedPriceId = this.getPriceId(plan);

    // Check if user is already on the requested plan
    if (currentPriceId === requestedPriceId) {
      throw new Error(`User is already on the ${plan} plan`);
    }

    const session = await this.stripe.billingPortal.sessions.create({
      customer: customerId,
      configuration: serverConfig.Stripe.portalConfigId,
      flow_data: {
        type: 'subscription_update_confirm',
        subscription_update_confirm: {
          subscription: subscription.id,
          items: [
            {
              id: subscription.items.data[0].id,
              price: requestedPriceId,
              quantity: 1,
            },
          ],
        },
      },
      return_url: `${serverConfig.baseURL}/dashboard/subscription`,
    });

    return session.url;
  }

  async getProducts(): Promise<
    {
      priceId: string;
      amount: number;
      interval: string | null;
      name: string;
      description: string;
      features: string[];
    }[]
  > {
    const priceIds = [serverConfig.Stripe.freePriceId!, serverConfig.Stripe.proPriceId!];

    const plans = await Promise.all(
      priceIds.map(async (priceId) => {
        if (!this.stripe) {
          throw new Error('Stripe client not initialized. Check Configuration');
        }

        const price = await this.stripe.prices.retrieve(priceId, {
          expand: ['product'],
        });

        const product = price.product as Stripe.Product;

        const featuresResponse = await this.stripe.products.listFeatures(product.id);
        const features = featuresResponse.data.map((pf) => pf.entitlement_feature.name);

        return {
          priceId: price.id,
          amount: (price.unit_amount || 0) / 100,
          interval: price.recurring?.interval || null,
          name: product.name,
          description: product.description || '',
          features,
        };
      })
    );

    return plans;
  }

  /**
   * Checks if the billing service is properly configured and accessible.
   * List products to check connection.
   *
   * @returns {Promise<boolean>} True if the connection is successful, false otherwise.
   */
  async checkConnection(): Promise<boolean> {
    if (!this.stripe) {
      this.lastConnectionError = 'Stripe client not initialized';
      return false;
    }

    try {
      // Test connection by listing products
      await this.stripe.products.list();
      return true;
    } catch (connectionError) {
      const errorMsg =
        connectionError instanceof Error ? connectionError.message : String(connectionError);

      console.error('Billing connection test failed:', {
        error: errorMsg,
      });

      this.lastConnectionError = `Connection error: ${errorMsg}`;
      return false;
    }
  }

  /**
   * Checks if the billing service configuration is valid and tests connection when configuration is complete.
   */
  async checkConfiguration(): Promise<ServiceConfigStatus> {
    // Check for missing configuration
    const missingConfig = this.validateMissingSettings();

    if (missingConfig.length > 0) {
      return {
        name: StripeBillingService.serviceName,
        configured: false,
        connected: undefined, // Don't test connection when configuration is missing
        configToReview: missingConfig,
        error: 'Configuration missing',
        description: this.description,
      };
    }

    // If configured, test the connection
    const isConnected = await this.checkConnection();
    if (!isConnected) {
      return {
        name: StripeBillingService.serviceName,
        configured: true,
        connected: false,
        configToReview: Object.values(StripeBillingService.requiredConfig).map(
          (config) => config.envVar
        ),
        error: this.lastConnectionError || 'Connection failed',
        description: this.description,
      };
    }
    return {
      name: StripeBillingService.serviceName,
      configured: true,
      connected: true,
      description: this.description,
    };
  }
}

