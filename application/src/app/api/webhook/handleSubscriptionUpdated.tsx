/* eslint-disable  @typescript-eslint/no-explicit-any */
import * as React from 'react';
import { SubscriptionPlanEnum, SubscriptionStatusEnum } from 'types';
import { getEmailSender, serverConfig } from '../../../settings';
import { createDatabaseService } from 'services/database/databaseFactory';
import { createEmailService } from 'services/email/emailFactory';
import { SubscriptionUpdatedEmail } from 'services/email/templates/SubscriptionUpdatedEmail';
import { createBillingService } from 'services/billing/billingFactory';
import { createInvoiceService } from 'services/invoice/invoiceFactory';
import { prepareInvoiceData } from 'services/invoice/invoiceUtlis';
import { InvoiceEmail } from 'services/email/templates/InvoiceEmail';

const PLAN_MAP: Record<string, SubscriptionPlanEnum> = {
  [serverConfig.Stripe.proPriceId!]: SubscriptionPlanEnum.PRO,
  [serverConfig.Stripe.freePriceId!]: SubscriptionPlanEnum.FREE,
};

/**
 * Handles the creation of a subscription.
 * Updates the subscription status to ACTIVE in the database.
 *
 * @param json - The JSON payload from the webhook event.
 * @throws Will throw an error if customer ID is not provided.
 */
export const handleSubscriptionUpdated = async (json: any) => {
  const customerId = json.data.object.customer;
  const priceId = json.data.object.items.data[0].price.id;

  if (!customerId || !priceId) {
    throw new Error(`Invalid event payload: missing ${!customerId ? 'customer' : 'price'} ID`);
  }

  const plan = PLAN_MAP[priceId];
  if (!plan) {
    console.warn(`⚠️ Ignoring unknown price ID: ${priceId}`);
    return;
  }

  const db = await createDatabaseService();

  const subscription = await db.subscription.updateByCustomerId(customerId, {
    status: SubscriptionStatusEnum.ACTIVE,
    plan,
  });

  try {
    const user = await db.user.findById(subscription.userId);

    if (!user) {
      console.warn(`⚠️ User not found for customer ID: ${subscription.userId}. Email not sent.`);
      return;
    }

    const billingService = await createBillingService();
    const plans = await billingService.getProducts();

    const currentPlan = plans.find((p) => p.priceId === priceId);

    if (!currentPlan) {
      console.warn(`⚠️ Plan not found for price ID: ${priceId}. Email not sent.`);
      return;
    }

    const emailClient = await createEmailService();

    if (emailClient.isEmailEnabled()) {
      // Send subscription update email
      await emailClient.sendReactEmail(
        user.email,
        'Your subscription was updated',
        <SubscriptionUpdatedEmail
          plan={{
            name: currentPlan.name,
            description: currentPlan.description,
            amount: currentPlan.amount,
            interval: currentPlan.interval,
            features: currentPlan.features,
            priceId: currentPlan.priceId,
          }}
        />
      );

      // Generate and send invoice for paid plans
      if (currentPlan.amount > 0) {
        try {
          const invoiceService = await createInvoiceService();
          const invoiceConfig = await invoiceService.checkConfiguration();
          
          if (invoiceConfig.configured && invoiceConfig.connected) {
            const invoiceData = prepareInvoiceData(user, currentPlan, subscription.id);
            const generatedInvoice = await invoiceService.generateInvoice(invoiceData);
            
            // Send invoice email
            await emailClient.sendReactEmail(
              user.email,
              generatedInvoice.subject,
              <InvoiceEmail
                invoiceHtml={generatedInvoice.html}
                customerName={user.name}
                planName={currentPlan.name}
                amount={currentPlan.amount}
                invoiceNumber={invoiceData.invoiceNumber}
                fromEmail={getEmailSender() || 'support@seanotes.com'}
              />
            );
            
            console.log(`✅ Invoice sent for subscription ${subscription.id}`);
          } else {
            console.warn(`⚠️ Invoice service not configured or connected. Invoice not sent.`);
          }
        } catch (invoiceError) {
          console.error('Error generating or sending invoice:', invoiceError);
          // Don't fail the entire webhook if invoice generation fails
        }
      }
    }

    console.log('✅ Subscription updated');
  } catch (error) {
    console.error('Error sending subscription update email.', error);
  }
};