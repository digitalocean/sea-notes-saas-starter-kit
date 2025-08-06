import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from 'lib/auth/withAuth';
import { HTTP_STATUS } from 'lib/api/http';
import { createInvoiceService } from 'services/invoice/invoiceFactory';
import { createEmailService } from 'services/email/emailFactory';
import { createDatabaseService } from 'services/database/databaseFactory';
import { createBillingService } from 'services/billing/billingFactory';
import { prepareInvoiceData } from 'services/invoice/invoiceUtlis';
import { InvoiceEmail } from 'services/email/templates/InvoiceEmail';
import { pdfService } from 'services/pdf/pdfService';
import { SubscriptionPlanEnum, SubscriptionStatusEnum } from 'types';
import { serverConfig } from '../../../../settings';

/**
 * API endpoint to generate and send an invoice for the user's current subscription.
 * Requires authentication and automatically detects the user's current plan.
 * Creates a FREE subscription if none exists.
 * Automatically attaches PDF version to the email.
 * 
 * Response:
 *   - 200: { success: true, message: string }
 *   - 400: { error: string }
 *   - 500: { error: string }
 */
async function generateInvoiceHandler(
  req: NextRequest,
  user: { id: string; role: string; email: string }
): Promise<Response> {
  try {
    // Get user details
    const db = await createDatabaseService();
    const userDetails = await db.user.findById(user.id);
    
    if (!userDetails) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: HTTP_STATUS.NOT_FOUND }
      );
    }

    // Get user's current subscription
    let userSubscription = await db.subscription.findByUserId(user.id);
    
    // If no subscription exists, create a FREE subscription
    if (!userSubscription || userSubscription.length === 0) {
      const billingService = await createBillingService();
      
      // Check if billing is configured
      const billingConfig = await billingService.checkConfiguration();
      if (!billingConfig.configured || !billingConfig.connected) {
        return NextResponse.json(
          { error: 'Billing service not configured. Cannot create subscription.' },
          { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
        );
      }

      // Create customer if needed
      let customerId;
      const customers = await billingService.listCustomer(user.email);
      if (customers.length > 0) {
        customerId = customers[0].id;
      } else {
        const customer = await billingService.createCustomer(user.email, {
          userId: user.email,
        });
        customerId = customer.id;
      }

      // Create FREE subscription
      await billingService.createSubscription(customerId, SubscriptionPlanEnum.FREE);
      
      // Create subscription record in database
      await db.subscription.create({
        customerId: customerId,
        plan: SubscriptionPlanEnum.FREE,
        status: SubscriptionStatusEnum.ACTIVE,
        userId: user.id,
      });

      // Fetch the newly created subscription
      userSubscription = await db.subscription.findByUserId(user.id);
    }

    const subscription = userSubscription[0];
    
    if (!subscription.plan) {
      // Default to FREE if no plan is set
      await db.subscription.update(user.id, {
        plan: SubscriptionPlanEnum.FREE,
        status: SubscriptionStatusEnum.ACTIVE,
      });
      // Update local copy to match database
      subscription.plan = SubscriptionPlanEnum.FREE;
    }

    // Get plan details from billing service
    const billingService = await createBillingService();
    const plans = await billingService.getProducts();
    
    // Find the plan that matches the user's subscription
    let selectedPlan;
    
    if (subscription.plan === 'FREE') {
      selectedPlan = plans.find(plan => plan.priceId === process.env.STRIPE_FREE_PRICE_ID);
    } else if (subscription.plan === 'PRO') {
      selectedPlan = plans.find(plan => plan.priceId === process.env.STRIPE_PRO_PRICE_ID);
    }
    
    if (!selectedPlan) {
      return NextResponse.json(
        { error: 'Plan details not found' },
        { status: HTTP_STATUS.NOT_FOUND }
      );
    }

    // Check invoice service configuration
    const invoiceService = await createInvoiceService();
    const invoiceConfig = await invoiceService.checkConfiguration();
    
    if (!invoiceConfig.configured || !invoiceConfig.connected) {
      return NextResponse.json(
        { error: 'Invoice service not configured or connected' },
        { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
      );
    }

    // Prepare invoice data using the actual subscription ID
    const invoiceData = prepareInvoiceData(userDetails, selectedPlan, subscription.id);
    
    // Generate invoice
    const generatedInvoice = await invoiceService.generateInvoice(invoiceData);
    
    // Generate PDF for email attachment
    let pdfBuffer: Buffer | null = null;
    let pdfFilename: string | null = null;
    
    try {
      const pdfAvailable = await pdfService.isAvailable();
      
      if (pdfAvailable) {
        pdfBuffer = await pdfService.generateInvoicePDF(generatedInvoice.html);
        pdfFilename = `invoice-${invoiceData.invoiceNumber}-${userDetails.name.replace(/\s+/g, '-')}.pdf`;
      }
    } catch {
      // PDF generation failed, continue without attachment
    }
    
    // Send invoice via email with PDF attachment
    const emailService = await createEmailService();
    
    if (emailService.isEmailEnabled()) {
      // Prepare email attachments
      const attachments = [];
      
      if (pdfBuffer && pdfFilename) {
        attachments.push({
          filename: pdfFilename,
          content: pdfBuffer,
          contentType: 'application/pdf'
        });
      }
      
      await emailService.sendReactEmail(
        userDetails.email,
        generatedInvoice.subject,
        <InvoiceEmail
          invoiceHtml={generatedInvoice.html}
          customerName={userDetails.name}
          planName={selectedPlan.name}
          amount={selectedPlan.amount}
          invoiceNumber={invoiceData.invoiceNumber}
          fromEmail={serverConfig.Resend.fromEmail || 'support@seanotes.com'}
        />,
        attachments
      );
      
      return NextResponse.json({
        success: true,
        message: `Invoice generated and sent to ${userDetails.email}`,
        invoiceNumber: invoiceData.invoiceNumber,
        planName: selectedPlan.name,
        amount: selectedPlan.amount,
        pdfAttached: !!pdfBuffer
      });
    } else {
      return NextResponse.json(
        { error: 'Email service is disabled' },
        { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
      );
    }
    
  } catch {
    return NextResponse.json(
      { error: 'Failed to generate invoice' },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
}

export const POST = withAuth(generateInvoiceHandler); 