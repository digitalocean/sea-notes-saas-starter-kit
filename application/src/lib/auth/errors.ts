// NextAuth imports
import { CredentialsSignin } from 'next-auth';

/**
 * Error thrown when provided credentials are invalid
 * This extends NextAuth's CredentialsSignin class to provide custom error handling
 */
export class InvalidCredentialsError extends CredentialsSignin {
  code = 'custom';
  
  constructor(message: string) {
    super(message);
    this.code = message;
  }
}