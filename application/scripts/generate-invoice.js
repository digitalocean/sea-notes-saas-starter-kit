#!/usr/bin/env node

/**
 * 🧾 Professional Invoice Generator
 * ---------------------------------
 * Generates HTML and plain-text invoices using
 * DigitalOcean Serverless Inference (OpenAI-compatible API).
 *
 * Author: Vansh Verma
 * Version: 2.0.0
 */

import fs from "fs";
import path from "path";
import chalk from "chalk";
import { config } from "dotenv";
import OpenAI from "openai";

// Load .env configuration
config();

const API_KEY = process.env.DO_INFERENCE_API_KEY;
const BASE_URL = "https://inference.do-ai.run/v1";

if (!API_KEY) {
  console.error(chalk.red("❌ Missing DO_INFERENCE_API_KEY in environment variables."));
  process.exit(1);
}

const client = new OpenAI({
  apiKey: API_KEY,
  baseURL: BASE_URL,
  timeout: 30_000,
  maxRetries: 3,
});

// -----------------------------------------------------------------------------
// 🧠 Utility Functions
// -----------------------------------------------------------------------------

/** Generates a unique invoice number with timestamp */
function generateInvoiceNumber() {
  const date = new Date();
  const formattedDate = date.toISOString().split("T")[0].replace(/-/g, "");
  const randomDigits = Math.floor(Math.random() * 9000 + 1000);
  return `INV-${formattedDate}-${randomDigits}`;
}

/** Ensures a directory exists before writing */
function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true });
}

/** Writes both HTML and text files to output */
function saveInvoiceFiles(invoice) {
  const outputDir = path.join(process.cwd(), "output");
  ensureDir(outputDir);

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const htmlPath = path.join(outputDir, `invoice-${timestamp}.html`);
  const txtPath = path.join(outputDir, `invoice-${timestamp}.txt`);

  fs.writeFileSync(htmlPath, invoice.html);
  fs.writeFileSync(txtPath, invoice.text);

  console.log(chalk.green("\n💾 Invoice saved:"));
  console.log("   HTML →", chalk.blue(htmlPath));
  console.log("   Text →", chalk.blue(txtPath));
}

/** Builds the LLM prompt for invoice generation */
function buildInvoicePrompt(data) {
  return `
Generate a professional HTML invoice for the following subscription details.

Customer Information:
- Name: ${data.customerName}
- Email: ${data.customerEmail}

Plan:
- Name: ${data.planName}
- Description: ${data.planDescription}
- Price: $${data.amount}
- Interval: ${data.interval}
- Features: ${data.features.join(", ")}

Invoice Info:
- Invoice #: ${data.invoiceNumber}
- Date: ${data.invoiceDate.toLocaleDateString()}
- Subscription ID: ${data.subscriptionId}

Requirements:
1. Include "SeaNotes" header branding.
2. Use professional, responsive design with blue theme (#0061EB).
3. Display plan, customer, and invoice details clearly.
4. Return valid JSON with: { html, text, subject }.
`;
}

/** Generates fallback invoice if AI call fails */
function generateFallbackInvoice(data) {
  const html = `
  <html><head><meta charset="utf-8"/><title>Invoice ${data.invoiceNumber}</title>
  <style>
  body { font-family: Arial; margin: 2rem; background: #f8f9fa; }
  .header { background: #0061EB; color: white; padding: 20px; border-radius: 8px; text-align: center; }
  .details, .item { margin-top: 20px; }
  .item { border-top: 1px solid #ddd; padding-top: 10px; }
  .total { font-weight: bold; margin-top: 10px; }
  </style></head>
  <body>
    <div class="header"><h1>SeaNotes</h1><h2>Invoice</h2></div>
    <div class="details">
      <p><strong>${data.customerName}</strong><br>${data.customerEmail}</p>
      <p><strong>Invoice #:</strong> ${data.invoiceNumber}<br>
      <strong>Date:</strong> ${data.invoiceDate.toLocaleDateString()}</p>
    </div>
    <div class="item">
      <h3>${data.planName}</h3>
      <p>${data.planDescription}</p>
      <ul>${data.features.map(f => `<li>${f}</li>`).join("")}</ul>
      <p class="total">Total: $${data.amount} (${data.interval})</p>
    </div>
  </body></html>
  `;

  const text = `
INVOICE #${data.invoiceNumber}
SeaNotes

Customer: ${data.customerName} (${data.customerEmail})
Date: ${data.invoiceDate.toLocaleDateString()}
Plan: ${data.planName}
Description: ${data.planDescription}
Features:
${data.features.map(f => `- ${f}`).join("\n")}
Total: $${data.amount} (${data.interval})

Thank you for your business!
  `.trim();

  return {
    html,
    text,
    subject: `Invoice #${data.invoiceNumber} - ${data.planName}`,
  };
}

// -----------------------------------------------------------------------------
// 🤖 Core Functions
// -----------------------------------------------------------------------------

async function testConnection() {
  try {
    console.log(chalk.cyan("🔍 Testing DigitalOcean connection..."));
    const models = await client.models.list();
    console.log(chalk.green("✅ Connection successful! Models:"));
    models.data.forEach(m => console.log("   -", m.id));
    return true;
  } catch (err) {
    console.error(chalk.red("❌ Connection test failed:"), err.message);
    return false;
  }
}

/**
 * Generates a professional invoice using LLM, with fallback.
 * @param {Object} invoiceData - invoice fields
 * @returns {Promise<{html: string, text: string, subject: string}>}
 */
async function generateInvoice(invoiceData) {
  console.log(chalk.cyan("\n🤖 Generating invoice for:"), chalk.bold(invoiceData.customerName));

  if (!(await testConnection())) {
    console.log(chalk.yellow("⚠️ Connection failed. Using fallback generator."));
    return generateFallbackInvoice(invoiceData);
  }

  const prompt = buildInvoicePrompt(invoiceData);

  try {
    const response = await client.chat.completions.create({
      model: "llama3-8b-instruct",
      messages: [
        {
          role: "system",
          content: "You are a professional invoice generator that outputs valid JSON {html, text, subject}.",
        },
        { role: "user", content: prompt },
      ],
      max_tokens: 2000,
      temperature: 0.2,
    });

    const content = response.choices?.[0]?.message?.content || "";
    const match = content.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("No valid JSON in AI response");

    const parsed = JSON.parse(match[0]);
    return parsed;
  } catch (err) {
    console.error(chalk.red("❌ Invoice generation failed:"), err.message);
    return generateFallbackInvoice(invoiceData);
  }
}

// -----------------------------------------------------------------------------
// 🚀 Main
// -----------------------------------------------------------------------------

async function main() {
  const invoiceData = {
    customerName: "John Doe",
    customerEmail: "john.doe@example.com",
    planName: "Pro Plan",
    planDescription: "Advanced features for professional users",
    amount: 12.0,
    interval: "monthly",
    features: ["Unlimited notes", "Sync", "Version history", "Priority support"],
    subscriptionId: "sub_12345",
    invoiceDate: new Date(),
    invoiceNumber: generateInvoiceNumber(),
  };

  const invoice = await generateInvoice(invoiceData);
  saveInvoiceFiles(invoice);

  console.log(chalk.green("\n✅ Invoice generated successfully!"));
  console.log(chalk.magentaBright("📧 Subject:"), invoice.subject);
  console.log("\n📄 Preview:\n" + invoice.text.slice(0, 300) + "...");
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(err => {
    console.error(chalk.red("💥 Fatal error:"), err.message);
    process.exit(1);
  });
}

export { generateInvoice, generateInvoiceNumber };
