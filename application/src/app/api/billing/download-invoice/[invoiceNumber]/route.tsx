import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from 'lib/auth/withAuth';
import { HTTP_STATUS } from 'lib/api/http';
import { createStorageService } from 'services/storage/storageFactory';

/**
 * API endpoint to download a specific invoice by invoice number.
 * Validates that the user owns the invoice before providing download access.
 * 
 * Response:
 *   - 200: { success: true, invoiceUrl: string, expiresAt: string }
 *   - 404: { error: string }
 *   - 403: { error: string }
 *   - 500: { error: string }
 */
async function downloadInvoiceHandler(
  req: NextRequest,
  user: { id: string; role: string; email: string },
  params: Promise<{ invoiceNumber: string }>
): Promise<Response> {
  try {
    const resolvedParams = await params;
    console.log('Resolved params:', resolvedParams);
    
    if (!resolvedParams || !resolvedParams.invoiceNumber) {
      console.error('Invalid params structure:', resolvedParams);
      return NextResponse.json(
        { error: 'Invalid request parameters' },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }
    
    const { invoiceNumber } = resolvedParams;

    if (!invoiceNumber) {
      return NextResponse.json(
        { error: 'Invoice number is required' },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

    // Validate invoice number format (basic validation)
    if (!invoiceNumber.match(/^INV-\d{8}-\d{4}$/)) {
      return NextResponse.json(
        { error: 'Invalid invoice number format' },
        { status: HTTP_STATUS.BAD_REQUEST }
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

    // Construct the file path for the invoice
    const fileName = `invoices/${user.id}/${invoiceNumber}.pdf`;

    try {
      // Get signed URL for download (expires in 1 hour)
      const downloadUrl = await storageService.getFileUrl(user.id, fileName, 3600);
      
      return NextResponse.json({
        success: true,
        invoiceUrl: downloadUrl,
        invoiceNumber: invoiceNumber,
        expiresAt: new Date(Date.now() + 3600 * 1000).toISOString()
      });
    } catch (storageError) {
      // If file doesn't exist or user doesn't have access, return 404
      console.error('Storage error:', storageError);
      return NextResponse.json(
        { error: 'Invoice not found or access denied' },
        { status: HTTP_STATUS.NOT_FOUND }
      );
    }
    
  } catch (error) {
    console.error('Failed to get invoice download URL:', error);
    return NextResponse.json(
      { error: 'Failed to get invoice download URL' },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
}

export const GET = withAuth(downloadInvoiceHandler); 