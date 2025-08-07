export interface ServerConfig {
  databaseProvider: string;
  storageProvider: string;
  emailProvider: string;
  billingProvider: string;
  invoiceProvider: string;
  enableEmailIntegration: boolean;
  baseURL?: string;
  GradientAI: {
    doInferenceApiKey?: string;
  };
  Database: {
    url?: string;
  };
  Spaces: {
    SPACES_KEY_ID?: string;
    SPACES_SECRET_KEY?: string;
    SPACES_BUCKET_NAME?: string;
    SPACES_REGION?: string;
    SEANOTES_SPACES_KEY_ID?: string;
    SEANOTES_SPACES_KEY_SECRET?: string;
    SEANOTES_SPACES_BUCKET_NAME?: string;
    SEANOTES_SPACES_REGION?: string;
  };
  Resend: {
    apiKey?: string;
    fromEmail?: string;
  };
  Stripe: {
    stripeSecretKey?: string;
    freePriceId?: string;
    proPriceId?: string;
    proGiftPriceId?: string;
    webhookSecret?: string;
    portalConfigId?: string;
  };
}

export const serverConfig: ServerConfig = {
  databaseProvider: process.env.DATABASE_PROVIDER || 'Postgres',
  storageProvider: process.env.STORAGE_PROVIDER || 'Spaces',
  emailProvider: process.env.EMAIL_PROVIDER || 'Resend',
  billingProvider: process.env.BILLING_PROVIDER || 'Stripe',
  invoiceProvider: process.env.INVOICE_PROVIDER || 'DigitalOcean GradientAI',
  enableEmailIntegration: process.env.ENABLE_EMAIL_INTEGRATION
    ? process.env.ENABLE_EMAIL_INTEGRATION === 'true'
    : false,
  baseURL: process.env.BASE_URL,
  Database: {
    url: process.env.DATABASE_URL,
  },
  Spaces: {
    SPACES_KEY_ID: process.env.SPACES_KEY_ID,
    SPACES_SECRET_KEY: process.env.SPACES_SECRET_KEY,
    SPACES_BUCKET_NAME: process.env.SPACES_BUCKET_NAME,
    SPACES_REGION: process.env.SPACES_REGION,
    SEANOTES_SPACES_KEY_ID: process.env.SEANOTES_SPACES_KEY_ID,
    SEANOTES_SPACES_KEY_SECRET: process.env.SEANOTES_SPACES_KEY_SECRET,
    SEANOTES_SPACES_BUCKET_NAME: process.env.SEANOTES_SPACES_BUCKET_NAME,
    SEANOTES_SPACES_REGION: process.env.SEANOTES_SPACES_REGION,
  },
  Resend: {
    apiKey: process.env.RESEND_API_KEY,
    fromEmail: process.env.RESEND_EMAIL_SENDER,
  },
  Stripe: {
    stripeSecretKey: process.env.STRIPE_SECRET_KEY,
    freePriceId: process.env.STRIPE_FREE_PRICE_ID,
    proPriceId: process.env.STRIPE_PRO_PRICE_ID,
    proGiftPriceId: process.env.STRIPE_PRO_GIFT_PRICE_ID,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
    portalConfigId: process.env.STRIPE_PORTAL_CONFIG_ID,
  },
  GradientAI: {
    doInferenceApiKey: process.env.DO_INFERENCE_API_KEY,
  },
};


// Client-side flag for DigitalOcean Gradient AI content generation (available in browser)
// Controls visibility of "Generate Note with AI" button in note creation
export const hasDigitalOceanGradientAIEnabled = process.env.NEXT_PUBLIC_DIGITALOCEAN_GRADIENTAI_ENABLED === 'true';

// Server-side check for GradientAI configuration
// Used by API routes and background services that require AI functionality
export const hasAIConfiguredServer = !!serverConfig.GradientAI.doInferenceApiKey;
