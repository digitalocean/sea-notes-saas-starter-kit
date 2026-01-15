# Invoice Storage Feature

This document describes the new invoice storage feature that allows users to generate and download invoices directly from the frontend, with the invoices being stored in DigitalOcean Spaces at `https://sea-notes-storage.blr1.digitaloceanspaces.com`.

## Overview

The invoice storage feature provides two ways for users to access their invoices:

1. **Email Invoice**: Sends the invoice via email (existing feature)
2. **Download Invoice**: Generates and uploads the invoice to DigitalOcean storage, then provides a downloadable link (new feature)

## Architecture

### Backend Components

1. **API Endpoint**: `/api/billing/generate-invoice-storage`
   - Generates invoice using AI service
   - Converts to PDF
   - Uploads to DigitalOcean Spaces
   - Returns invoice number (no direct URL for security)

2. **API Endpoint**: `/api/billing/download-invoice/[invoiceNumber]`
   - Validates user ownership of invoice
   - Returns signed download URL with 1-hour expiry
   - Ensures users can only access their own invoices

3. **Services Used**:
   - Invoice Service: Generates professional invoices using AI
   - PDF Service: Converts HTML invoices to PDF
   - Storage Service: Uploads files to DigitalOcean Spaces
   - Database Service: Retrieves user and subscription data
   - Billing Service: Gets plan details from Stripe

### Frontend Components

1. **InvoiceGenerator Component**: 
   - Located at `src/components/Subscription/InvoiceGenerator.tsx`
   - Provides a simple download button that triggers the entire process
   - Shows loading states and error handling
   - Automatically downloads the generated invoice

2. **Updated Subscription Page**:
   - Now includes both email and download options
   - Located at `src/components/Subscription/SubscriptionPage.tsx`

## Features

### Invoice Generation
- Uses the same AI-powered invoice generation as the email feature
- Creates professional, branded invoices with company styling
- Includes all subscription details (plan, amount, features, etc.)

### Storage and Security
- Invoices are stored in DigitalOcean Spaces (`https://sea-notes-storage.blr1.digitaloceanspaces.com`) with private ACL
- Download URLs are signed and expire after 1 hour
- Files are organized by user ID and invoice number
- Path structure: `invoices/{userId}/{invoiceNumber}.pdf`
- Users can only access invoices they generated (no direct file access)
- Invoice number format validation prevents unauthorized access

### User Experience
- Simple download button that triggers the entire process
- One-click invoice generation and download
- Real-time status updates (loading, error)
- Automatic download trigger
- Fresh invoice generated on each download

## Configuration Requirements

### Environment Variables
Make sure these are configured in your `.env` file:

```bash
# DigitalOcean Spaces (for storage)
SPACES_KEY_ID=your-access-key-id
SPACES_SECRET_KEY=your-access-key-secret
SPACES_REGION=blr1
SPACES_BUCKET_NAME=sea-notes-storage

# AI Service (for invoice generation)
GRADIENT_AI_INFERENCE_KEY=your-do-inference-api-key

# PDF Service (for PDF generation)
# (Depends on your PDF service configuration)

# Stripe (for billing data)
STRIPE_SECRET_KEY=your-stripe-secret-key
STRIPE_FREE_PRICE_ID=price_free_plan
STRIPE_PRO_PRICE_ID=price_pro_plan
```

### Service Dependencies
1. **DigitalOcean Spaces**: Must be configured and accessible
2. **AI Service**: Must be configured for invoice generation
3. **PDF Service**: Must be available for PDF conversion
4. **Stripe**: Must be configured for billing data

## Usage

### For Users
1. Navigate to the Subscription page (`/dashboard/subscription`)
2. Scroll to the "Invoice Management" section
3. Click "Download Invoice" to generate and download your invoice
4. The system will generate a fresh invoice, store it in DigitalOcean Spaces, and trigger the download
5. Each download generates a new invoice with current subscription details

### For Developers
The feature can be tested using the existing test files:
- `src/app/api/billing/generate-invoice-storage/route.test.ts`
- `src/app/api/billing/download-invoice/[invoiceNumber]/route.test.ts`
- `src/components/Subscription/InvoiceGenerator.test.tsx`

## API Response Format

### Generate Invoice Response
```json
{
  "success": true,
  "invoiceNumber": "INV-20241201-1234",
  "planName": "Pro Plan",
  "amount": 12.00,
  "message": "Invoice generated and stored successfully. Use the download button to access it."
}
```

### Download Invoice Response
```json
{
  "success": true,
  "invoiceUrl": "https://example.com/signed-url",
  "invoiceNumber": "INV-20241201-1234",
  "expiresAt": "2024-12-01T13:00:00.000Z"
}
```

### Error Response
```json
{
  "error": "Error message describing what went wrong"
}
```

## Error Handling

The system handles various error scenarios:

1. **User not found**: Returns 404
2. **Service not configured**: Returns 500 with specific error message
3. **PDF generation failed**: Returns 500
4. **Storage upload failed**: Returns 500
5. **Invalid invoice number format**: Returns 400
6. **Invoice not found or access denied**: Returns 404
7. **Network errors**: Returns 500

## Security Considerations

1. **Authentication**: All requests require user authentication
2. **Authorization**: Users can only access their own invoices
3. **File Access**: Invoices are stored with private ACL
4. **URL Expiry**: Download URLs expire after 1 hour
5. **User Isolation**: Files are organized by user ID
6. **Invoice Number Validation**: Strict format validation prevents unauthorized access
7. **Separate Endpoints**: Generation and download are separate for better security
8. **No Direct URL Storage**: URLs are generated on-demand, not stored in frontend

## Performance Considerations

1. **Caching**: No caching implemented - each request generates a new invoice
2. **File Size**: PDFs are typically small (< 1MB)
3. **Concurrent Requests**: Limited by AI service and storage service capacity
4. **Cleanup**: No automatic cleanup of old invoices (manual cleanup required)

## Future Enhancements

Potential improvements for the future:

1. **Invoice History**: Store and display list of generated invoices
2. **Automatic Cleanup**: Implement cleanup of old invoice files
3. **Invoice Templates**: Allow customization of invoice templates
4. **Bulk Generation**: Generate invoices for multiple periods
5. **Invoice Preview**: Show preview before download
6. **Email Integration**: Option to email the stored invoice

## Troubleshooting

### Common Issues

1. **"Storage service not configured"**
   - Check DigitalOcean Spaces configuration
   - Verify environment variables are set correctly

2. **"Invoice service not configured"**
   - Check AI service configuration
   - Verify GRADIENT_AI_INFERENCE_KEY is set

3. **"PDF generation failed"**
   - Check PDF service configuration
   - Verify all dependencies are installed

4. **Download link doesn't work**
   - Links expire after 1 hour
   - Generate a new invoice to get a fresh link

### Debug Steps

1. Check system status page (`/system-status`) for service health
2. Verify environment variables are loaded correctly
3. Check browser console for frontend errors
4. Check server logs for backend errors
5. Test individual services (AI, PDF, Storage) separately 