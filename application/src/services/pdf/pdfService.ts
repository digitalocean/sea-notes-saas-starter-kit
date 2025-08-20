import * as puppeteer from 'puppeteer';

export interface PDFOptions {
  format?: 'A4' | 'Letter' | 'Legal';
  margin?: {
    top?: string;
    right?: string;
    bottom?: string;
    left?: string;
  };
  printBackground?: boolean;
  preferCSSPageSize?: boolean;
}

/**
 * PDF service that converts HTML content to PDF using Puppeteer
 */
export class PDFService {
  private browser: puppeteer.Browser | null = null;

  /**
   * Initialize the browser instance
   */
  private async getBrowser(): Promise<puppeteer.Browser> {
    if (!this.browser) {
      try {
        console.log('Launching Puppeteer browser...');
        this.browser = await puppeteer.launch({
          headless: true,
          args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--disable-gpu'
          ]
        });
        console.log('Puppeteer browser launched successfully');
      } catch (error) {
        console.error('Failed to launch Puppeteer browser:', {
          error: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined
        });
        throw error;
      }
    }
    return this.browser;
  }

  /**
   * Convert HTML content to PDF
   */
  async generatePDF(html: string, options: PDFOptions = {}): Promise<Buffer> {
    const browser = await this.getBrowser();
    const page = await browser.newPage();

    try {
      // Set content and wait for it to load
      await page.setContent(html, {
        waitUntil: 'networkidle0',
        timeout: 30000
      });

      // Set viewport for consistent rendering
      await page.setViewport({
        width: 1200,
        height: 800,
        deviceScaleFactor: 2 // Higher resolution for better quality
      });

      // Generate PDF with options
      const pdfBuffer = await page.pdf({
        format: options.format || 'A4',
        margin: options.margin || {
          top: '20mm',
          right: '20mm',
          bottom: '20mm',
          left: '20mm'
        },
        printBackground: options.printBackground !== false, // Default to true
        preferCSSPageSize: options.preferCSSPageSize || false,
        displayHeaderFooter: false
      });

      // Convert Uint8Array to Buffer for Puppeteer v24
      return Buffer.from(pdfBuffer);
    } finally {
      await page.close();
    }
  }

  /**
   * Convert HTML content to PDF with custom CSS for better invoice formatting
   */
  async generateInvoicePDF(html: string): Promise<Buffer> {
    // Ensure we have a complete HTML document
    let completeHTML = html;
    
    // If the HTML doesn't start with <!DOCTYPE, wrap it in a complete document
    if (!html.trim().startsWith('<!DOCTYPE')) {
      completeHTML = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invoice</title>
  <style>
    * { box-sizing: border-box; }
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; 
      margin: 0; 
      padding: 10px; 
      background-color: #f5f5f5; 
      line-height: 1.6;
    }
    .container { 
      max-width: 600px; 
      margin: 0 auto; 
      background: white; 
      border-radius: 8px; 
      box-shadow: 0 2px 10px rgba(0,0,0,0.1); 
      overflow: hidden;
    }
    .header { 
      background: #0061EB; 
      color: white; 
      padding: 30px 20px; 
      text-align: center; 
    }
    .header h1 { 
      margin: 0 0 10px 0; 
      font-size: 28px; 
      font-weight: 600;
    }
    .header h2 { 
      margin: 0; 
      font-size: 20px; 
      font-weight: 400;
      opacity: 0.9;
    }
    .content { 
      padding: 30px 20px; 
    }
    .invoice-details { 
      display: flex; 
      flex-direction: column;
      gap: 20px;
      margin-bottom: 30px; 
    }
    @media (min-width: 600px) {
      .invoice-details { 
        flex-direction: row; 
        justify-content: space-between; 
      }
    }
    .customer-info, .invoice-info { 
      flex: 1; 
    }
    .invoice-info { 
      text-align: left; 
    }
    @media (min-width: 600px) {
      .invoice-info { 
        text-align: right; 
      }
    }
    .customer-info h3, .invoice-info h3 { 
      margin: 0 0 10px 0; 
      font-size: 16px; 
      color: #333;
    }
    .customer-info p, .invoice-info p { 
      margin: 0; 
      font-size: 14px; 
      color: #666;
    }
    .item { 
      border-bottom: 1px solid #eee; 
      padding: 20px 0; 
    }
    .item h3 { 
      margin: 0 0 10px 0; 
      font-size: 18px; 
      color: #333;
    }
    .item p { 
      margin: 0 0 15px 0; 
      color: #666;
    }
    .total { 
      font-size: 18px; 
      font-weight: bold; 
      margin-top: 20px; 
      padding-top: 20px; 
      border-top: 2px solid #0061EB; 
      color: #333;
    }
    .features { 
      margin-top: 15px; 
    }
    .features strong { 
      display: block; 
      margin-bottom: 8px; 
      color: #333;
    }
    .features ul { 
      margin: 5px 0; 
      padding-left: 20px; 
      color: #666;
    }
    .features li { 
      margin-bottom: 4px; 
    }
    .support-section { 
      margin-top: 30px; 
      text-align: center; 
      padding: 20px; 
      background-color: #f8f9fa; 
      border-radius: 8px;
    }
    .support-section p { 
      margin: 0 0 15px 0; 
      color: #666; 
      font-size: 14px;
    }
    .contact-button { 
      display: inline-block !important; 
      background: #0061EB !important; 
      color: white !important; 
      text-decoration: none !important; 
      padding: 12px 24px !important; 
      border-radius: 6px !important; 
      font-weight: 500 !important; 
      font-size: 14px !important; 
      transition: background-color 0.2s !important;
      min-width: 140px !important;
      text-align: center !important;
      border: none !important;
      cursor: pointer !important;
      box-sizing: border-box !important;
    }
    .contact-button:hover { 
      background: #0051c3 !important; 
    }
    .contact-button:active { 
      background: #004094 !important; 
    }
    .footer { 
      margin-top: 20px; 
      text-align: center; 
      color: #666; 
      font-size: 12px;
    }
    .footer p { 
      margin: 5px 0; 
    }
    @media (max-width: 480px) {
      body { padding: 5px; }
      .header { padding: 20px 15px; }
      .header h1 { font-size: 24px; }
      .header h2 { font-size: 18px; }
      .content { padding: 20px 15px; }
      .contact-button { 
        display: block !important; 
        width: 100% !important; 
        text-align: center !important; 
        margin-top: 10px !important;
        box-sizing: border-box !important;
      }
      .support-section {
        padding: 15px !important;
      }
    }
    @media print {
      body { 
        margin: 0; 
        padding: 0; 
        background: white !important;
      }
      .container { 
        max-width: none !important; 
        margin: 0 !important; 
        box-shadow: none !important;
        border-radius: 0 !important;
      }
      .header { 
        page-break-inside: avoid; 
        break-inside: avoid;
      }
      .content { 
        page-break-inside: avoid; 
        break-inside: avoid;
      }
      .support-section { 
        page-break-inside: avoid; 
        break-inside: avoid;
      }
      .contact-button { 
        display: none !important; 
      }
      @page { 
        margin: 20mm; 
        size: A4; 
      }
    }
  </style>
</head>
<body>
${html}
</body>
</html>`;
    } else {
      // If it's already a complete HTML document, inject our CSS to override any existing styles
      // Handle both single and double quotes in the HTML
      const cssInjection = `<style>
        /* Override any existing contact-button styles with maximum specificity */
        .contact-button, 
        a.contact-button,
        a[class*="contact-button"],
        a[href*="mailto:"],
        .support-section .contact-button,
        .support-section a[href*="mailto"],
        div a.contact-button,
        div a[href*="mailto:"] { 
          display: inline-block !important; 
          background: #0061EB !important; 
          background-color: #0061EB !important; 
          color: white !important; 
          color: #ffffff !important; 
          text-decoration: none !important; 
          text-decoration: none !important; 
          padding: 12px 24px !important; 
          border-radius: 6px !important; 
          font-weight: 500 !important; 
          font-size: 14px !important; 
          transition: background-color 0.2s !important;
          min-width: 140px !important;
          text-align: center !important;
          border: none !important;
          border: 0 !important;
          cursor: pointer !important;
          box-sizing: border-box !important;
          margin: 0 !important;
          line-height: 1.2 !important;
          font-family: inherit !important;
          outline: none !important;
          -webkit-appearance: none !important;
          -moz-appearance: none !important;
          appearance: none !important;
        }
        .contact-button:hover, 
        a.contact-button:hover,
        a[class*="contact-button"]:hover,
        a[href*="mailto:"]:hover,
        a[href*="mailto:support@dostarterkit.com"]:hover,
        .support-section .contact-button:hover,
        .support-section a[href*="mailto"]:hover,
        div a.contact-button:hover,
        div a[href*="mailto:support"]:hover { 
          background: #0051c3 !important; 
          background-color: #0051c3 !important; 
        }
        .contact-button:active, 
        a.contact-button:active,
        a[class*="contact-button"]:active,
        a[href*="mailto:"]:active,
        a[href*="mailto:support@dostarterkit.com"]:active,
        .support-section .contact-button:active,
        .support-section a[href*="mailto"]:active,
        div a.contact-button:active,
        div a[href*="mailto:support"]:active { 
          background: #004094 !important; 
          background-color: #004094 !important; 
        }
        @media (max-width: 480px) {
          .contact-button, 
          a.contact-button,
          a[class*="contact-button"],
          a[href*="mailto:"],
            .support-section .contact-button,
          .support-section a[href*="mailto"],
          div a.contact-button,
          div a[href*="mailto:"] { 
            display: block !important; 
            width: 100% !important; 
            text-align: center !important; 
            margin-top: 10px !important;
            box-sizing: border-box !important;
          }
        }
      </style>`;
      
      // Inject CSS into existing HTML document
      if (completeHTML.includes('</head>')) {
        completeHTML = completeHTML.replace('</head>', cssInjection + '</head>');
      } else if (completeHTML.includes("</head>")) {
        completeHTML = completeHTML.replace("</head>", cssInjection + "</head>");
      } else {
        // If we can't find </head>, inject before </html>
        if (completeHTML.includes('</html>')) {
          completeHTML = completeHTML.replace('</html>', cssInjection + '</html>');
        } else if (completeHTML.includes("</html>")) {
          completeHTML = completeHTML.replace("</html>", cssInjection + "</html>");
        } else {
          // Last resort: inject at the end
          completeHTML = completeHTML + cssInjection;
        }
      }
    }

    const browser = await this.getBrowser();
    const page = await browser.newPage();

    try {
      console.log('Setting page content...');
      // Set content and wait for it to load
      await page.setContent(completeHTML, {
        waitUntil: ['networkidle0', 'domcontentloaded'],
        timeout: 30000
      });

      console.log('Setting viewport...');
      // Set viewport for consistent rendering
      await page.setViewport({
        width: 1200,
        height: 800,
        deviceScaleFactor: 2 // Higher resolution for better quality
      });

      console.log('Waiting for content to render...');
      // Wait a bit more for any dynamic content to render
      await new Promise(res => setTimeout(res, 2000));

      console.log('Generating PDF...');
      // Generate PDF with options
      const pdfBuffer = await page.pdf({
        format: 'A4',
        margin: {
          top: '20mm',
          right: '20mm',
          bottom: '20mm',
          left: '20mm'
        },
        printBackground: true,
        preferCSSPageSize: false,
        displayHeaderFooter: false
      });

      console.log('PDF generated, converting to Buffer...');
      // Convert Uint8Array to Buffer for Puppeteer v24
      const result = Buffer.from(pdfBuffer);
      console.log('PDF Buffer created, size:', result.length);
      return result;
    } catch (error) {
      console.error('Error during PDF generation:', {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      });
      throw error;
    } finally {
      await page.close();
    }
  }

  /**
   * Close the browser instance
   */
  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  /**
   * Check if the PDF service is available
   */
  async isAvailable(): Promise<boolean> {
    try {
      const browser = await this.getBrowser();
      const page = await browser.newPage();
      await page.setContent('<html><body><h1>Test</h1></body></html>');
      await page.close();
      return true;
    } catch {
      console.error('PDF service not available');
      return false;
    }
  }
}

// Export a singleton instance
export const pdfService = new PDFService(); 