import { Resend } from 'resend';
import { serverConfig } from '../../settings';
import { EmailService, EmailAttachment } from './email';
import { ServiceConfigStatus } from '../status/serviceConfigStatus';

/**
 * Email service implementation using the Resend API.
 */
export class ResendEmailService extends EmailService {
  private resend: Resend | null = null;
  private fromEmail: string = '';
  private isConfigured: boolean = false;
  private lastConnectionError: string = '';
  private description: string =
    'The following features are impacted: email verification (signup), password reset email confirmation';

  // Service name for consistent display across all status responses
  private static readonly serviceName = 'Email Service (Resend)';
  // Required config items with their corresponding env var names and descriptions
  private static requiredConfig = {
    apiKey: { envVar: 'RESEND_API_KEY', description: 'Resend API Key' },
    fromEmail: { envVar: 'RESEND_EMAIL_SENDER', description: 'From email address' },
  };
  constructor() {
    super();
    this.initializeClient();
  }

  /**
   * Initializes the Resend client based on the configuration.
   * Sets isConfigured flag if applicable.
   */
  private initializeClient(): void {
    try {
      const apiKey = serverConfig.Resend.apiKey;
      const fromEmail = serverConfig.Resend.fromEmail;

      // Check for missing configuration
      const missingConfig = Object.entries(ResendEmailService.requiredConfig)
        .filter(([key]) => !serverConfig.Resend[key as keyof typeof serverConfig.Resend])
        .map(([, value]) => value.envVar);

      if (missingConfig.length > 0) {
        this.isConfigured = false;
        return;
      }

      this.fromEmail = fromEmail!;
      this.resend = new Resend(apiKey!);
      this.isConfigured = true;
    } catch (error) {
      this.isConfigured = false;
      console.error('Failed to initialize Resend client:', error);
    }
  }

  isEmailEnabled(): boolean {
    return serverConfig.enableEmailIntegration;
  }

  async sendReactEmail(
    to: string, 
    subject: string, 
    body: React.ReactNode, 
    attachments?: EmailAttachment[]
  ): Promise<void> {
    if (!this.resend) {
      throw new Error('Email client not initialized. Check configuration.');
    }

    try {
      // Prepare email data
      const emailData: {
        from: string;
        to: string[];
        subject: string;
        react: React.ReactNode;
        attachments?: Array<{
          filename: string;
          content: string;
          contentType: string;
        }>;
      } = {
        from: this.fromEmail,
        to: [to],
        subject,
        react: body,
      };

      // Add attachments if provided
      if (attachments && attachments.length > 0) {
        emailData.attachments = attachments.map(attachment => ({
          filename: attachment.filename,
          content: attachment.content.toString('base64'), // Convert Buffer to base64
          contentType: attachment.contentType,
        }));
      }

      console.log('Sending email with attachments:', {
        to,
        subject,
        hasAttachments: attachments && attachments.length > 0,
        attachmentCount: attachments?.length || 0
      });

      const result = await this.resend.emails.send(emailData);

      if (result.error) throw new Error(result.error.message);
      
      console.log('Email sent successfully:', result);
    } catch (error) {
      console.error('Error sending email:', error);
      throw new Error(
        `Failed to send email: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Checks if the email service is properly configured and accessible.
   * Sends a test email to verify the connection.
   *
   * @returns {Promise<boolean>} True if the connection is successful, false otherwise.
   */
  async checkConnection(): Promise<boolean> {
    if (!this.resend) {
      this.lastConnectionError = 'Email client not initialized';
      return false;
    }

    try {
      // Test connection by sending a verification email to ourselves
      // This is a lightweight way to test the API without actually sending emails
      const result = await this.resend.emails.send({
        from: this.fromEmail,
        to: [this.fromEmail], // Send to ourselves for testing
        subject: 'Service Health Check',
        html: '<p>This is an automated health check email. Please ignore.</p>',
      });

      if (result.error) throw new Error(result.error.message);

      return true;
    } catch (connectionError) {
      const errorMsg =
        connectionError instanceof Error ? connectionError.message : String(connectionError);

      console.error('Email connection test failed:', {
        error: errorMsg,
      });

      this.lastConnectionError = `Connection error: ${errorMsg}`;
      return false;
    }
  }

  /**
   * Checks if the email service configuration is valid and tests connection when configuration is complete.
   */
  async checkConfiguration(): Promise<ServiceConfigStatus> {
    // Check for missing configuration
    const missingConfig = Object.entries(ResendEmailService.requiredConfig)
      .filter(([key]) => !serverConfig.Resend[key as keyof typeof serverConfig.Resend])
      .map(([, value]) => value.envVar);

    if (missingConfig.length > 0) {
      return {
        name: ResendEmailService.serviceName,
        configured: false,
        connected: undefined, // Don't test connection when configuration is missing
        configToReview: missingConfig,
        error: 'Configuration missing',
        description: this.description,
      };
    }

    // If configured, test the connection
    const isConnected = await this.checkConnection();
    if (!isConnected) {
      return {
        name: ResendEmailService.serviceName,
        configured: true,
        connected: false,
        configToReview: Object.values(ResendEmailService.requiredConfig).map(
          (config) => config.envVar
        ),
        error: this.lastConnectionError || 'Connection failed',
        description: this.description,
      };
    }
    return {
      name: ResendEmailService.serviceName,
      configured: true,
      connected: true,
    };
  }
}