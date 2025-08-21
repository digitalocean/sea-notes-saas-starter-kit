import html2pdf from 'html2pdf.js';

export interface ClientPDFOptions {
  filename?: string;
  margin?: number;
  image?: { type: string; quality: number };
  html2canvas?: { scale: number; useCORS: boolean };
  jsPDF?: { unit: string; format: string; orientation: string };
}

/**
 * Client-side PDF service that generates PDFs in the browser using html2pdf.js
 * This works reliably in production since it runs in the user's browser
 */
export class ClientPDFService {
  /**
   * Generate PDF from HTML content
   * @param htmlContent - The HTML content to convert to PDF
   * @param options - PDF generation options
   * @returns Promise that resolves when PDF is generated and downloaded
   */
  static async generatePDF(
    htmlContent: string,
    options: ClientPDFOptions = {}
  ): Promise<void> {
    // Create a temporary container for the HTML content
    const container = document.createElement('div');
    container.innerHTML = htmlContent;
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    container.style.top = '-9999px';
    container.style.width = '800px'; // Set a fixed width for consistent layout
    
    // Add the container to the DOM temporarily
    document.body.appendChild(container);

    try {
      // Configure html2pdf options
      const pdfOptions = {
        margin: options.margin || 10,
        filename: options.filename || 'invoice.pdf',
        image: options.image || { type: 'jpeg', quality: 0.98 },
        html2canvas: options.html2canvas || { 
          scale: 2, 
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff'
        },
        jsPDF: options.jsPDF || { 
          unit: 'mm', 
          format: 'a4', 
          orientation: 'portrait' 
        }
      };

      // Generate and download the PDF
      await html2pdf()
        .from(container)
        .set(pdfOptions)
        .save();

    } finally {
      // Clean up the temporary container
      document.body.removeChild(container);
    }
  }

  /**
   * Generate PDF from an existing DOM element
   * @param element - The DOM element to convert to PDF
   * @param options - PDF generation options
   * @returns Promise that resolves when PDF is generated and downloaded
   */
  static async generatePDFFromElement(
    element: HTMLElement,
    options: ClientPDFOptions = {}
  ): Promise<void> {
    const pdfOptions = {
      margin: options.margin || 10,
      filename: options.filename || 'document.pdf',
      image: options.image || { type: 'jpeg', quality: 0.98 },
      html2canvas: options.html2canvas || { 
        scale: 2, 
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      },
      jsPDF: options.jsPDF || { 
        unit: 'mm', 
        format: 'a4', 
        orientation: 'portrait' 
      }
    };

    await html2pdf()
      .from(element)
      .set(pdfOptions)
      .save();
  }

  /**
   * Generate PDF from HTML string with custom styling
   * @param htmlContent - The HTML content to convert
   * @param customCSS - Additional CSS to apply
   * @param options - PDF generation options
   * @returns Promise that resolves when PDF is generated and downloaded
   */
  static async generatePDFWithCustomCSS(
    htmlContent: string,
    customCSS: string,
    options: ClientPDFOptions = {}
  ): Promise<void> {
    // Create a complete HTML document with custom CSS
    const completeHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Generated PDF</title>
          <style>
            ${customCSS}
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              line-height: 1.6;
              color: #333;
              margin: 0;
              padding: 20px;
            }
            * { box-sizing: border-box; }
          </style>
        </head>
        <body>
          ${htmlContent}
        </body>
      </html>
    `;

    await this.generatePDF(completeHTML, options);
  }
}

export default ClientPDFService;
