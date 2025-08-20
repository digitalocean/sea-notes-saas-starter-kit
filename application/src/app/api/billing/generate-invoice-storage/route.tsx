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
    console.log('Available plans:', plans.map(p => ({ name: p.name, priceId: p.priceId })));
    console.log('User subscription plan:', subscription.plan);
    console.log('Environment variables:', {
      STRIPE_FREE_PRICE_ID: process.env.STRIPE_FREE_PRICE_ID,
      STRIPE_PRO_PRICE_ID: process.env.STRIPE_PRO_PRICE_ID
    });
    
    // Find the plan that matches the user's subscription
    let selectedPlan;
    
    if (subscription.plan === 'FREE') {
      selectedPlan = plans.find(plan => plan.priceId === process.env.STRIPE_FREE_PRICE_ID);
      console.log('Looking for FREE plan with priceId:', process.env.STRIPE_FREE_PRICE_ID);
    } else if (subscription.plan === 'PRO') {
      selectedPlan = plans.find(plan => plan.priceId === process.env.STRIPE_PRO_PRICE_ID);
      console.log('Looking for PRO plan with priceId:', process.env.STRIPE_PRO_PRICE_ID);
    }
    
    console.log('Selected plan:', selectedPlan);
    
    if (!selectedPlan) {
      console.error('Plan not found for subscription:', {
        userPlan: subscription.plan,
        availablePlans: plans,
        freePriceId: process.env.STRIPE_FREE_PRICE_ID,
        proPriceId: process.env.STRIPE_PRO_PRICE_ID
      });
      return NextResponse.json(
        { error: 'Plan details not found' },
        { status: HTTP_STATUS.NOT_FOUND }
      );
    }

    // Check invoice service configuration
    const invoiceService = await createInvoiceService();
    const invoiceConfig = await invoiceService.checkConfiguration();
    console.log('Invoice service config:', invoiceConfig);
    
    if (!invoiceConfig.configured || !invoiceConfig.connected) {
      console.error('Invoice service not properly configured:', invoiceConfig);
      return NextResponse.json(
        { error: 'Invoice service not configured or connected' },
        { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
      );
    }

    // Check storage service configuration
    const storageService = await createStorageService();
    const storageConfig = await storageService.checkConfiguration();
    console.log('Storage service config:', storageConfig);
    
    if (!storageConfig.configured || !storageConfig.connected) {
      console.error('Storage service not properly configured:', storageConfig);
      console.error('Check if SPACES_KEY_SECRET is set in your .env file');
      return NextResponse.json(
        { error: 'Storage service not configured or connected' },
        { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
      );
    }

    // Prepare invoice data using the actual subscription ID
    const invoiceData = prepareInvoiceData(userDetails, selectedPlan, subscription.id);
    console.log('Invoice data prepared:', {
      invoiceNumber: invoiceData.invoiceNumber,
      customerName: invoiceData.customerName,
      planName: invoiceData.planName
    });
    
    // Generate invoice
    console.log('Generating invoice using AI service...');
    const generatedInvoice = await invoiceService.generateInvoice(invoiceData);
    console.log('Invoice generated successfully, HTML length:', generatedInvoice.html?.length || 0);
    
    // Generate PDF for storage
    let pdfBuffer: Buffer | null = null;
    
    try {
      console.log('Checking PDF service availability...');
      const pdfAvailable = await pdfService.isAvailable();
      console.log('PDF service available:', pdfAvailable);
      
      if (pdfAvailable) {
        console.log('Generating PDF invoice...');
        pdfBuffer = await pdfService.generateInvoicePDF(generatedInvoice.html);
        console.log('PDF generated successfully, size:', pdfBuffer?.length || 0);
      } else {
        console.log('PDF service not available, cannot generate PDF');
      }
    } catch (pdfError) {
      console.error('PDF generation failed:', {
        error: pdfError instanceof Error ? pdfError.message : String(pdfError),
        stack: pdfError instanceof Error ? pdfError.stack : undefined
      });
      return NextResponse.json(
        { error: 'Failed to generate PDF invoice' },
        { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
      );
    }

    if (!pdfBuffer) {
      console.error('PDF buffer is null or empty');
      return NextResponse.json(
        { error: 'PDF generation failed - no PDF content generated' },
        { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
      );
    }

    // Upload PDF to storage with a unique path
    const fileName = `invoices/${user.id}/${invoiceData.invoiceNumber}.pdf`;
    
    console.log('Attempting to upload invoice to storage:', {
      userId: user.id,
      fileName,
      pdfBufferSize: pdfBuffer?.length || 0
    });
    
    // Convert Buffer to File-like object for storage service
    const file = new File([pdfBuffer], `${invoiceData.invoiceNumber}.pdf`, {
      type: 'application/pdf'
    });

    try {
      await storageService.uploadFile(user.id, fileName, file, { ACL: 'private' });
      console.log('Invoice uploaded successfully to storage');
    } catch (uploadError) {
      console.error('Failed to upload invoice to storage:', {
        userId: user.id,
        fileName,
        error: uploadError instanceof Error ? uploadError.message : String(uploadError)
      });
      throw uploadError;
    }

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