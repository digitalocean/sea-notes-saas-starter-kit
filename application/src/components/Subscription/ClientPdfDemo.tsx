import React from 'react';
import { Button, Box, Typography, Paper } from '@mui/material';
import { PictureAsPdf as PdfIcon } from '@mui/icons-material';
import ClientPDFService from 'services/pdf/clientPdfService';

/**
 * Demo component to showcase client-side PDF generation
 * This demonstrates how PDFs can be generated directly in the browser
 */
const ClientPdfDemo: React.FC = () => {
  const handleGenerateSamplePDF = async () => {
    try {
      const sampleHTML = `
        <div class="invoice-container">
          <div class="invoice-header">
            <h1>Sample Invoice</h1>
            <p>Generated with Client-Side PDF Service</p>
          </div>
          
          <div class="invoice-details">
            <div>
              <strong>Invoice #:</strong> DEMO-001<br>
              <strong>Date:</strong> ${new Date().toLocaleDateString()}<br>
              <strong>Due Date:</strong> ${new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}
            </div>
            <div>
              <strong>From:</strong><br>
              SeaNotes<br>
              support@seanotes.com
            </div>
          </div>
          
          <div class="invoice-items">
            <h3>Items</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <thead>
                <tr style="border-bottom: 1px solid #e0e0e0;">
                  <th style="text-align: left; padding: 10px;">Description</th>
                  <th style="text-align: right; padding: 10px;">Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style="padding: 10px;">Pro Plan Subscription</td>
                  <td style="text-align: right; padding: 10px;">$12.00</td>
                </tr>
                <tr>
                  <td style="padding: 10px;">Premium Features</td>
                  <td style="text-align: right; padding: 10px;">$3.00</td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <div class="invoice-total">
            <strong>Total: $15.00</strong>
          </div>
          
          <div style="text-align: center; margin-top: 30px;">
            <a href="mailto:support@seanotes.com" class="contact-button">
              Contact Support
            </a>
          </div>
        </div>
      `;

      await ClientPDFService.generatePDFWithCustomCSS(
        sampleHTML,
        `
          .invoice-container {
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          }
          .invoice-header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #0061EB;
            padding-bottom: 20px;
          }
          .invoice-header h1 {
            color: #0061EB;
            margin: 0 0 10px 0;
          }
          .invoice-details {
            display: flex;
            justify-content: space-between;
            margin-bottom: 30px;
            padding: 20px;
            background-color: #f8f9fa;
            border-radius: 8px;
          }
          .invoice-items {
            margin-bottom: 30px;
          }
          .invoice-items table {
            width: 100%;
            border-collapse: collapse;
          }
          .invoice-items th,
          .invoice-items td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #e0e0e0;
          }
          .invoice-items th {
            background-color: #f8f9fa;
            font-weight: 600;
          }
          .invoice-total {
            text-align: right;
            font-size: 1.2em;
            font-weight: bold;
            border-top: 2px solid #0061EB;
            padding-top: 20px;
            margin-top: 20px;
          }
          .contact-button {
            display: inline-block;
            background: #0061EB;
            color: white !important;
            text-decoration: none;
            padding: 12px 24px;
            border-radius: 6px;
            font-weight: 500;
            text-align: center;
            margin-top: 20px;
          }
          .contact-button:hover {
            background: #0051c3;
          }
        `,
        {
          filename: 'sample-invoice-demo.pdf',
          margin: 15,
          html2canvas: { scale: 2, useCORS: true },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        }
      );
    } catch (error) {
      console.error('Failed to generate sample PDF:', error);
    }
  };

  return (
    <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Client-Side PDF Generation Demo
      </Typography>
      
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        This demonstrates how PDFs can be generated directly in your browser using html2pdf.js. 
        This approach works reliably in production since it doesn't depend on server-side dependencies.
      </Typography>
      
      <Button
        variant="contained"
        startIcon={<PdfIcon />}
        onClick={handleGenerateSamplePDF}
        sx={{ mb: 2 }}
      >
        Generate Sample PDF
      </Button>
      
      <Typography variant="caption" display="block" color="text.secondary">
        Click the button above to generate a sample invoice PDF. The PDF will be generated 
        in your browser and automatically downloaded.
      </Typography>
    </Paper>
  );
};

export default ClientPdfDemo;
