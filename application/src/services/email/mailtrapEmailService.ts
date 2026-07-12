import { render } from '@react-email/render';
import { MailtrapClient } from 'mailtrap';
import { serverConfig } from '../../settings';
import { EmailService, EmailAttachment } from './email';
import { ServiceConfigStatus } from '../status/serviceConfigStatus';

/**
 * Email service implementation using the Mailtrap API.
 */
export class MailtrapEmailService extends EmailService {
  private client: MailtrapClient | null = null;
  private fromEmail: string = '';
  private lastConnectionError: string = '';
  private description: string =
    'The following features are impacted: email verification (signup), password reset email confirmation';

  // Service name for consistent display across all status responses
  private static readonly serviceName = 'Email Service (Mailtrap)';
  // Required config items with their corresponding env var names and descriptions
  private static requiredConfig = {
    apiToken: { envVar: 'MAILTRAP_API_TOKEN', description: 'Mailtrap API Token' },
    fromEmail: { envVar: 'MAILTRAP_EMAIL_SENDER', description: 'From email address' },
  };
  constructor() {
    super();
    this.initializeClient();
  }

  /**
   * Initializes the Mailtrap client based on the configuration.
   */
  private initializeClient(): void {
    try {
      const apiToken = serverConfig.Mailtrap.apiToken;
      const fromEmail = serverConfig.Mailtrap.fromEmail;
      const sandbox = serverConfig.Mailtrap.sandbox;
      const testInboxId = serverConfig.Mailtrap.testInboxId
        ? Number(serverConfig.Mailtrap.testInboxId)
        : undefined;

      // Check for missing configuration
      const missingConfig = Object.entries(MailtrapEmailService.requiredConfig)
        .filter(([key]) => !serverConfig.Mailtrap[key as keyof typeof serverConfig.Mailtrap])
        .map(([, value]) => value.envVar);

      if (sandbox && (testInboxId == null || Number.isNaN(testInboxId))) {
        missingConfig.push('MAILTRAP_TEST_INBOX_ID');
      }

      if (missingConfig.length > 0) {
        return;
      }

      this.fromEmail = fromEmail!;
      this.client = new MailtrapClient({
        token: apiToken!,
        ...(sandbox
          ? {
              sandbox: true,
              testInboxId,
            }
          : {}),
      });
    } catch (error) {
      console.error('Failed to initialize Mailtrap client:', error);
    }
  }

  isEmailEnabled(): boolean {
    return serverConfig.enableEmailIntegration;
  }

  /**
   * Sends an email with React components as the body and optional attachments.
   *
   * @param to - Recipient email address
   * @param subject - Email subject line
   * @param body - React component to render as email body
   * @param attachments - Optional array of local file attachments (in-memory Buffers)
   *                      Note: Uses local attachment approach - file content is sent directly.
   *                      Remote URL attachments are not supported.
   * @throws Error if email client is not initialized or sending fails
   */
  async sendReactEmail(
    to: string,
    subject: string,
    body: React.ReactNode,
    attachments?: EmailAttachment[]
  ): Promise<void> {
    if (!this.client) {
      throw new Error('Email client not initialized. Check configuration.');
    }

    try {
      // Prepare base email data
      // Mailtrap expects HTML rather than React nodes, so render first
      interface EmailData {
        from: { email: string };
        to: Array<{ email: string }>;
        subject: string;
        html: string;
        category: string;
        attachments?: Array<{
          filename: string;
          content: Buffer;
          type: string;
          disposition: string;
        }>;
      }

      const emailData: EmailData = {
        from: { email: this.fromEmail },
        to: [{ email: to }],
        subject,
        html: await render(body),
        category: 'transactional',
      };

      // Add attachments if provided
      // Note: This implementation uses local attachments only (in-memory Buffers)
      // Remote URL attachments are not currently supported
      if (attachments && attachments.length > 0) {
        emailData.attachments = attachments.map((attachment) => ({
          filename: attachment.filename,
          content: attachment.content,
          type: attachment.contentType,
          disposition: 'attachment',
        }));
      }

      console.log('Sending email with attachments:', {
        to,
        subject,
        hasAttachments: attachments && attachments.length > 0,
        attachmentCount: attachments?.length || 0,
      });

      const result = await this.client.send(emailData);

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
    if (!this.client) {
      this.lastConnectionError = 'Email client not initialized';
      return false;
    }

    try {
      // Test connection by sending a verification email to ourselves
      await this.client.send({
        from: { email: this.fromEmail },
        to: [{ email: this.fromEmail }], // Send to ourselves for testing
        subject: 'Service Health Check',
        html: '<p>This is an automated health check email. Please ignore.</p>',
        category: 'health-check',
      });

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
    const missingConfig = Object.entries(MailtrapEmailService.requiredConfig)
      .filter(([key]) => !serverConfig.Mailtrap[key as keyof typeof serverConfig.Mailtrap])
      .map(([, value]) => value.envVar);

    if (
      serverConfig.Mailtrap.sandbox &&
      (!serverConfig.Mailtrap.testInboxId ||
        Number.isNaN(Number(serverConfig.Mailtrap.testInboxId)))
    ) {
      missingConfig.push('MAILTRAP_TEST_INBOX_ID');
    }

    if (missingConfig.length > 0) {
      return {
        name: MailtrapEmailService.serviceName,
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
        name: MailtrapEmailService.serviceName,
        configured: true,
        connected: false,
        configToReview: [
          ...Object.values(MailtrapEmailService.requiredConfig).map((config) => config.envVar),
          ...(serverConfig.Mailtrap.sandbox ? ['MAILTRAP_TEST_INBOX_ID'] : []),
        ],
        error: this.lastConnectionError || 'Connection failed',
        description: this.description,
      };
    }
    return {
      name: MailtrapEmailService.serviceName,
      configured: true,
      connected: true,
    };
  }
}
