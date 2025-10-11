import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from 'lib/auth/withAuth';
import { HTTP_STATUS } from 'lib/api/http';
import { createInvoiceService } from 'services/invoice/invoiceFactory';
import { createDatabaseService } from 'services/database/databaseFactory';
import { createBillingService } from 'services/billing/billingFactory';
import { createStorageService } from 'services/storage/storageFactory';
import { prepareInvoiceData } from 'services/invoice/invoiceUtlis';
import { pdfService } from 'services/pdf/pdfService';
import { SubscriptionPlanEnum, SubscriptionStatusEnum } from 'types';

/**
 * API endpoint to generate an invoice and upload it to DigitalOcean storage.
 * Returns a downloadable URL for the invoice.
 * 
 * Response:
 *   - 200: { success: true, invoiceUrl: string, invoiceNumber: string }
 *   - 400: { error: string }
 *   - 500: { error: string }
 */
async function generateInvoiceStorageHandler(
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

    // Check storage service configuration
    const storageService = await createStorageService();
    const storageConfig = await storageService.checkConfiguration();
    
    if (!storageConfig.configured || !storageConfig.connected) {
      return NextResponse.json(
        { error: 'Storage service not configured or connected' },
        { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
      );
    }

    // Prepare invoice data using the actual subscription ID
    const invoiceData = prepareInvoiceData(userDetails, selectedPlan, subscription.id);
    
    // Generate invoice
    const generatedInvoice = await invoiceService.generateInvoice(invoiceData);
    
    // Generate PDF for storage
    let pdfBuffer: Buffer | null = null;
    
    try {
      const pdfAvailable = await pdfService.isAvailable();
      
      if (pdfAvailable) {
        pdfBuffer = await pdfService.generateInvoicePDF(generatedInvoice.html);
      }
    } catch (pdfError) {
      console.error('PDF generation failed:', pdfError);
      return NextResponse.json(
        { error: 'Failed to generate PDF invoice' },
        { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
      );
    }

    if (!pdfBuffer) {
      return NextResponse.json(
        { error: 'PDF generation failed' },
        { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
      );
    }

    // Upload PDF to storage with a unique path
    const fileName = `invoices/${user.id}/${invoiceData.invoiceNumber}.pdf`;
    
    // Convert Buffer to File-like object for storage service
    const file = new File([new Uint8Array(pdfBuffer)], `${invoiceData.invoiceNumber}.pdf`, {
      type: 'application/pdf'
    });

    await storageService.uploadFile(user.id, fileName, file, { ACL: 'private' });

    return NextResponse.json({
      success: true,
      invoiceNumber: invoiceData.invoiceNumber,
      planName: selectedPlan.name,
      amount: selectedPlan.amount,
      message: 'Invoice generated and stored successfully. Use the download button to access it.'
    });
    
  } catch (error) {
    console.error('Failed to generate and upload invoice:', error);
    return NextResponse.json(
      { error: 'Failed to generate and upload invoice' },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
}

export const POST = withAuth(generateInvoiceStorageHandler); 