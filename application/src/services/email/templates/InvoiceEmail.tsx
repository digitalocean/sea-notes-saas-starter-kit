import * as React from 'react';
import { EmailLayout } from './EmailLayout';
import { Container, Section, Text, Hr } from '@react-email/components';

/**
 * Props for the InvoiceEmail component.
 */
export interface InvoiceEmailProps {
  invoiceHtml: string;
  customerName: string;
  planName: string;
  amount: number;
  invoiceNumber: string;
  fromEmail: string;
}

/**
 * InvoiceEmail React email template.
 * Renders a transactional email for sending invoices to customers.
 * Uses @react-email/components for compatibility with email clients.
 */
export function InvoiceEmail({ 
  invoiceHtml, 
  customerName, 
  planName, 
  amount, 
  invoiceNumber,
  fromEmail
}: InvoiceEmailProps) {
  // Before rendering, replace the contact button with a table-based, inline-styled button for email compatibility
  const safeInvoiceHtml = invoiceHtml.replace(
    /<a[^>]*class=['"]contact-button['"][^>]*href=['"]mailto:([^'"]*)['"][^>]*>.*?<\/a>/gi,
    (_, emailAddress) => `<table role="presentation" border="0" cellpadding="0" cellspacing="0" style="margin: 16px auto;">
      <tr>
        <td align="center" bgcolor="#0061EB" style="border-radius:6px;">
          <a href="mailto:${emailAddress}" target="_blank" style="display:inline-block;padding:12px 24px;font-size:14px;font-weight:500;color:#fff;text-decoration:none;border-radius:6px;background:#0061EB;">Contact Support</a>
        </td>
      </tr>
    </table>`
  );

  return (
    <EmailLayout title={`Invoice #${invoiceNumber} - ${planName}`}>
      <Container
        style={{
          background: '#fff',
          borderRadius: 8,
          maxWidth: 600,
          margin: '32px auto',
          padding: 0,
        }}
      >
        <Section style={{ padding: '32px 24px' }}>
          <Text style={{ textAlign: 'center', margin: '0 0 24px 0' }}>
            Hello {customerName},
          </Text>
          <Text style={{ textAlign: 'center', margin: '0 0 24px 0' }}>
            Thank you for your subscription to <b>{planName}</b>. 
            Your invoice for ${amount} is ready and attached to this email as a PDF file.
          </Text>
          
          <Hr style={{ margin: '24px 0' }} />
          
          <div 
            dangerouslySetInnerHTML={{ __html: safeInvoiceHtml }}
            style={{
              border: '1px solid #e0e0e0',
              borderRadius: '8px',
              padding: '20px',
              backgroundColor: '#fafafa'
            }}
          />
          
          <Hr style={{ margin: '24px 0' }} />
          
          <Text style={{ fontSize: 14, color: '#666', textAlign: 'center', margin: '24px 0 0 0' }}>
            This invoice is sent as HTML for better compatibility across email clients.
          </Text>
          <Text style={{ fontSize: 14, color: '#666', textAlign: 'center', margin: '8px 0 0 0' }}>
            To download a PDF version, use the "Download Invoice" button in your dashboard.
          </Text>
          <Text style={{ fontSize: 14, color: '#666', textAlign: 'center', margin: '8px 0 0 0' }}>
            If you have any questions about this invoice, please contact us at {fromEmail}.
          </Text>
          <Text style={{ fontSize: 14, color: '#666', textAlign: 'center', margin: '8px 0 0 0' }}>
            Thank you for choosing SeaNotes!
          </Text>
        </Section>
      </Container>
    </EmailLayout>
  );
} 