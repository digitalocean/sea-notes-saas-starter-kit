#!/usr/bin/env node

// Load environment variables from .env file
require('dotenv').config();

const fs = require('fs');
const path = require('path');
const { Gradient } = require('@digitalocean/gradient');

// DigitalOcean Serverless Inference configuration
const apiKey = process.env.DO_INFERENCE_API_KEY;

if (!apiKey) {
  console.error('❌ Error: API key not found. Please set the DO_INFERENCE_API_KEY environment variable.');
  process.exit(1);
}

const client = new Gradient({
  accessToken:  apiKey,
  timeout: 30000,
  maxRetries: 3,
  baseURL: 'https://inference.do-ai.run/v1',
});


async function testConnection() {
  try {
    console.log('🔍 Testing connection to DigitalOcean Serverless Inference...');
    //const models = await client.models.list(); this won't work with gradient inference
    const response = await client.chat.completions.create({
      model: "llama3-8b-instruct", // 
      messages: [{ role: "user", content: "ping" }],
      max_tokens: 5,
    });

    console.log('✅ Connection successful! Test output:', response.choices?.[0]?.message?.content || "<no content>");

    return true;
  } catch (error) {
    console.error('❌ Connection test failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', JSON.stringify(error.response.data, null, 2));
    }
    return false;
  }
}

/**
 * Generates a professional invoice using DigitalOcean's serverless inference
 */
async function generateInvoice(invoiceData) {
  try {
    console.log('🤖 Generating invoice with DigitalOcean Serverless Inference...');

    // First test the connection
    const connectionTest = await testConnection();
    if (!connectionTest) {
      console.log('⚠️ Connection test failed, using fallback invoice generation');
      return generateFallbackInvoice(invoiceData);
    }

    const prompt = buildInvoicePrompt(invoiceData);

    const response = await client.chat.completions.create({
      model: "llama3-8b-instruct", 
      messages: [
        {
          role: "system",
          content: `You are a professional invoice generator. You create beautiful, professional invoices in HTML format that are suitable for email delivery. 
          Always include proper styling, company branding, and all necessary invoice details. 
          Return your response as a JSON object with three fields: html (the full HTML invoice), text (plain text version), and subject (email subject line).
          Make sure the JSON is properly formatted and valid.`
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 2000, 
      temperature: 0.1
    });

    console.log('✅ Received response from serverless inference');

    if (response && response.choices && response.choices.length > 0) {
      const aiResponse = response.choices[0].message.content;
      
      // Parse the AI response to extract JSON
      try {
        const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          return {
            html: parsed.html || generateFallbackInvoice(invoiceData).html,
            text: parsed.text || generateFallbackInvoice(invoiceData).text,
            subject: parsed.subject || generateFallbackInvoice(invoiceData).subject
          };
        } else {
          throw new Error('No JSON found in AI response');
        }
      } catch (parseError) {
        console.error('❌ Error parsing AI response:', parseError);
        console.log('AI response (first 500 chars):', aiResponse.substring(0, 500));
        return generateFallbackInvoice(invoiceData);
      }
    }

    // If no valid response, return fallback
    console.log('⚠️ No valid response received, using fallback');
    return generateFallbackInvoice(invoiceData);

  } catch (error) {
    console.error('❌ Error generating invoice:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', JSON.stringify(error.response.data, null, 2));
    }
    if (error.status === 500) {
      console.error('💡 500 error troubleshooting:');
      console.error('   - Check if your API key is valid');
      console.error('   - Verify the model name is correct');
      console.error('   - Try reducing the prompt length');
      console.error('   - Check if there are any rate limits');
    }
    return generateFallbackInvoice(invoiceData);
  }
}

function buildInvoicePrompt(invoiceData) {
  return `Generate a professional invoice for the following subscription:

Customer Information:
- Name: ${invoiceData.customerName}
- Email: ${invoiceData.customerEmail}

Plan Details:
- Plan Name: ${invoiceData.planName}
- Description: ${invoiceData.planDescription}
- Amount: $${invoiceData.amount}
- Billing Interval: ${invoiceData.interval || 'one-time'}
- Features: ${invoiceData.features.join(', ')}

Invoice Details:
- Invoice Number: ${invoiceData.invoiceNumber}
- Invoice Date: ${invoiceData.invoiceDate.toLocaleDateString()}
- Subscription ID: ${invoiceData.subscriptionId}

Please create a professional invoice with:
1. Company header with "SeaNotes" branding
2. Customer and invoice details clearly displayed
3. Itemized breakdown of the subscription
4. Professional styling with blue color scheme (#0061EB)
5. Mobile-responsive design
6. Clear call-to-action for payment or support

Return the response as a valid JSON object with three fields:
- html: the complete HTML invoice
- text: plain text version of the invoice
- subject: email subject line

Make sure the JSON is properly formatted and escaped.`;
}

function generateFallbackInvoice(invoiceData) {
  console.log('⚠️ Using fallback invoice generation');

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Invoice - ${invoiceData.invoiceNumber}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { background: #0061EB; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { padding: 30px; }
        .invoice-details { display: flex; justify-content: space-between; margin-bottom: 30px; }
        .customer-info, .invoice-info { flex: 1; }
        .invoice-info { text-align: right; }
        .item { border-bottom: 1px solid #eee; padding: 15px 0; }
        .total { font-size: 18px; font-weight: bold; margin-top: 20px; padding-top: 20px; border-top: 2px solid #0061EB; }
        .features { margin-top: 15px; }
        .features ul { margin: 5px 0; padding-left: 20px; }
        @media (max-width: 600px) {
          .invoice-details { flex-direction: column; }
          .invoice-info { text-align: left; margin-top: 20px; }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>SeaNotes</h1>
          <h2>Invoice</h2>
        </div>
        <div class="content">
          <div class="invoice-details">
            <div class="customer-info">
              <h3>Bill To:</h3>
              <p><strong>${invoiceData.customerName}</strong><br>
              ${invoiceData.customerEmail}</p>
            </div>
            <div class="invoice-info">
              <h3>Invoice Details:</h3>
              <p><strong>Invoice #:</strong> ${invoiceData.invoiceNumber}<br>
              <strong>Date:</strong> ${invoiceData.invoiceDate.toLocaleDateString()}<br>
              <strong>Subscription ID:</strong> ${invoiceData.subscriptionId}</p>
            </div>
          </div>
          
          <div class="item">
            <h3>${invoiceData.planName}</h3>
            <p>${invoiceData.planDescription}</p>
            <div class="features">
              <strong>Features included:</strong>
              <ul>
                ${invoiceData.features.map(feature => `<li>${feature}</li>`).join('')}
              </ul>
            </div>
            <div class="total">
              <strong>Total: $${invoiceData.amount}</strong>
              ${invoiceData.interval ? `<br><small>Billed ${invoiceData.interval}ly</small>` : ''}
            </div>
          </div>
          
          <div style="margin-top: 30px; text-align: center; color: #666;">
            <p>Thank you for your subscription!</p>
            <p>If you have any questions, please contact our support team.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
INVOICE - ${invoiceData.invoiceNumber}
SeaNotes

Invoice Date: ${invoiceData.invoiceDate.toLocaleDateString()}

Bill To:
${invoiceData.customerName}
${invoiceData.customerEmail}

Subscription ID: ${invoiceData.subscriptionId}

ITEM:
${invoiceData.planName}
${invoiceData.planDescription}

Features included:
${invoiceData.features.map(feature => `- ${feature}`).join('\n')}

TOTAL: $${invoiceData.amount}
${invoiceData.interval ? `Billed ${invoiceData.interval}ly` : ''}

Thank you for your subscription!
If you have any questions, please contact our support team.
  `;

  return {
    html,
    text,
    subject: `Invoice #${invoiceData.invoiceNumber} - ${invoiceData.planName} Subscription`
  };
}

function generateInvoiceNumber() {
  const date = new Date();
  const dateStr = date.getFullYear().toString() + 
    (date.getMonth() + 1).toString().padStart(2, '0') + 
    date.getDate().toString().padStart(2, '0');
  const randomNum = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `INV-${dateStr}-${randomNum}`;
}

// Example usage
async function main() {
  const invoiceData = {
    customerName: 'John Doe',
    customerEmail: 'john.doe@example.com',
    planName: 'Pro Plan',
    planDescription: 'Advanced features for power users',
    amount: 12.00,
    interval: 'month',
    features: ['Unlimited notes', 'Real-time sync', 'Version history', 'Priority support'],
    subscriptionId: 'sub_123456789',
    invoiceDate: new Date(),
    invoiceNumber: generateInvoiceNumber(),
  };

  console.log('📄 Generating invoice for:', invoiceData.customerName);
  console.log('📋 Plan:', invoiceData.planName);
  console.log('💰 Amount: $' + invoiceData.amount);
  console.log('📅 Invoice #:', invoiceData.invoiceNumber);
  console.log('');

  const invoice = await generateInvoice(invoiceData);

  console.log('✅ Invoice generated successfully!');
  console.log('📧 Subject:', invoice.subject);
  console.log('');

  // Save the invoice to files
  const outputDir = path.join(__dirname, 'output');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const htmlFile = path.join(outputDir, `invoice-${timestamp}.html`);
  const textFile = path.join(outputDir, `invoice-${timestamp}.txt`);

  fs.writeFileSync(htmlFile, invoice.html);
  fs.writeFileSync(textFile, invoice.text);

  console.log('💾 Invoice saved to:');
  console.log('   HTML:', htmlFile);
  console.log('   Text:', textFile);
  console.log('');
  console.log('📄 Invoice preview (first 500 chars):');
  console.log(invoice.text.substring(0, 500) + '...');
}

// Run the script
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Script failed:', error.message);
    process.exit(1);
  });
}

module.exports = { generateInvoice, generateInvoiceNumber };