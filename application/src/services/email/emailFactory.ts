import { EmailService } from './email';
import { serverConfig } from 'settings';

// Email provider types
export type EmailProvider = 'Resend' | 'Mailtrap';

/**
 * Factory function to create and return the appropriate email service based on configuration.
 * Uses dynamic imports to avoid circular dependencies.
 */
export async function createEmailService(): Promise<EmailService> {
  const emailProvider = serverConfig.emailProvider;

  switch (emailProvider) {
    case 'Mailtrap': {
      const { MailtrapEmailService } = await import('./mailtrapEmailService');
      return new MailtrapEmailService();
    }
    case 'Resend':
    default: {
      const { ResendEmailService } = await import('./resendEmailService');
      return new ResendEmailService();
    }
    // Add more providers here in the future
    // case 'SMTP': {
    //   const { SMTPEmailService } = await import('./smtpEmailService');
    //   return new SMTPEmailService();
    // }
  }
}
