import { InvoiceService, InvoiceData } from './invoiceService';

// Mock axios
jest.mock('axios');
import axios from 'axios';
const mockAxios = axios as jest.Mocked<typeof axios>;

// Mock serverConfig
const mockServerConfig: {
  GradientAI: {
    doInferenceApiKey?: string;
  };
} = {
  GradientAI: {
    doInferenceApiKey: 'test-api-key',
  },
};

jest.mock('../../settings', () => ({
  serverConfig: mockServerConfig,
}));

describe('InvoiceService', () => {
  let invoiceService: InvoiceService;

  beforeEach(() => {
    invoiceService = new InvoiceService();
    jest.clearAllMocks();
  });

  describe('checkConfiguration', () => {
    it('should return configured true when all config is present', async () => {
      const config = await invoiceService.checkConfiguration();
      
      expect(config.configured).toBe(true);
      expect(config.name).toBe('Invoice Service (DigitalOcean Serverless Inference)');
    });

    it('should return configured false when config is missing', async () => {
      // Temporarily modify the mock
      const originalConfig = { ...mockServerConfig };
      mockServerConfig.GradientAI.doInferenceApiKey = undefined;

      const newService = new InvoiceService();
      const config = await newService.checkConfiguration();
      
      expect(config.configured).toBe(false);
      expect(config.configToReview).toContain('doInferenceApiKey');

      // Restore original config
      Object.assign(mockServerConfig, originalConfig);
    });
  });

  describe('generateInvoice', () => {
    const mockInvoiceData: InvoiceData = {
      customerName: 'John Doe',
      customerEmail: 'john@example.com',
      planName: 'Pro Plan',
      planDescription: 'Advanced features for power users',
      amount: 12.00,
      interval: 'month',
      features: ['Unlimited notes', 'Real-time sync'],
      subscriptionId: 'sub_123',
      invoiceDate: new Date('2024-01-01'),
      invoiceNumber: 'INV-20240101-0001',
    };

    it('should generate invoice with AI when service is configured', async () => {
      const mockResponse = {
        data: {
          choices: [
            {
              message: {
                content: JSON.stringify({
                  html: '<html>Test Invoice</html>',
                  text: 'Test Invoice Text',
                  subject: 'Test Invoice Subject',
                }),
              },
            },
          ],
        },
      };

      mockAxios.post.mockResolvedValue(mockResponse);

      const result = await invoiceService.generateInvoice(mockInvoiceData);

      expect(result.html).toBe('<html>Test Invoice</html>');
      expect(result.text).toBe('Test Invoice Text');
      expect(result.subject).toBe('Test Invoice Subject');
      expect(mockAxios.post).toHaveBeenCalledWith(
        'https://api.digitalocean.com/v2/ai/inference',
        expect.objectContaining({
          model: 'claude-3.5-sonnet',
          messages: expect.arrayContaining([
            expect.objectContaining({
              role: 'system',
              content: expect.stringContaining('professional invoice generator'),
            }),
            expect.objectContaining({
              role: 'user',
              content: expect.stringContaining('John Doe'),
            }),
          ]),
        }),
        expect.objectContaining({
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer test-api-key',
          },
        })
      );
    });

    it('should fallback to template when AI response is invalid', async () => {
      const mockResponse = {
        data: {
          choices: [
            {
              message: {
                content: 'Invalid response without JSON',
              },
            },
          ],
        },
      };

      mockAxios.post.mockResolvedValue(mockResponse);

      const result = await invoiceService.generateInvoice(mockInvoiceData);

      expect(result.html).toContain('SeaNotes');
      expect(result.html).toContain('John Doe');
      expect(result.html).toContain('Pro Plan');
      expect(result.text).toContain('INVOICE - INV-20240101-0001');
      expect(result.subject).toContain('INV-20240101-0001');
    });

    it('should fallback to template when AI service fails', async () => {
      mockAxios.post.mockRejectedValue(new Error('Network error'));

      const result = await invoiceService.generateInvoice(mockInvoiceData);

      expect(result.html).toContain('SeaNotes');
      expect(result.html).toContain('John Doe');
      expect(result.html).toContain('Pro Plan');
      expect(result.text).toContain('INVOICE - INV-20240101-0001');
      expect(result.subject).toContain('INV-20240101-0001');
    });

    it('should throw error when service is not configured', async () => {
      // Temporarily modify the mock to simulate unconfigured service
      const originalConfig = { ...mockServerConfig };
      mockServerConfig.GradientAI.doInferenceApiKey = undefined;

      const newService = new InvoiceService();

      await expect(newService.generateInvoice(mockInvoiceData)).rejects.toThrow(
        'Invoice service not configured'
      );

      // Restore original config
      Object.assign(mockServerConfig, originalConfig);
    });
  });

  describe('isRequired', () => {
    it('should return false as invoice service is optional', () => {
      expect(invoiceService.isRequired()).toBe(false);
    });
  });
}); 