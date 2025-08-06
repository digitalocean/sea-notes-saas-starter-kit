import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import type { Provider } from 'next-auth/providers';
import { createDatabaseService } from 'services/database/databaseFactory';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from '../prisma';
import { verifyPassword } from 'helpers/hash';
import { User, UserRole } from 'types';
import { InvalidCredentialsError } from './errors';
import { serverConfig } from '../../settings';

const hasRole = (user: unknown): user is { id: string; role: UserRole } => {
  return typeof user === 'object' && user !== null && 'role' in user && 'id' in user;
};

const verifyMagicLinkToken = async (token: string, email: string) => {
  const db = await createDatabaseService();

  const verification = await db.verificationToken.find(email, token);
  if (!verification || verification.expires < new Date()) {
    if (verification) {
      await db.verificationToken.delete(email, token);
    }

    throw new Error('Invalid or expired token');
  }

  await db.verificationToken.delete(email, token);

  return true;
};

const providers: Provider[] = [
  Credentials({
    credentials: {
      email: {},
      password: {},
      magicLinkToken: {},
    },
    authorize: async (credentials) => {
      try {
        const dbClient = await createDatabaseService();
        if (credentials.magicLinkToken && credentials.email) {
          await verifyMagicLinkToken(
            credentials.magicLinkToken as string,
            credentials.email as string
          );
          const user = await dbClient.user.findByEmail(credentials.email as string);
          if (!user) {
            throw new Error('User not found');
          }
          return user;
        }

        if (!credentials.email || !credentials.password) {
          throw new Error('Email and password are required');
        }

        const user = await dbClient.user.findByEmail(credentials.email as string);
        if (!user || !user.passwordHash) {
          throw new Error('User not found or password hash is missing');
        }

        if (user.emailVerified === false && serverConfig.enableEmailIntegration) {
          throw new Error('Email not verified');
        }

        const isValid = await verifyPassword(credentials.password as string, user.passwordHash);
        if (!isValid) {
          throw new Error('Invalid credentials');
        }

        return user;
      } catch (error) {
        throw new InvalidCredentialsError((error as Error).message);
      }
    },
  }),
];

process.env.AUTH_URL = process.env.BASE_URL;

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  adapter: PrismaAdapter(prisma),
  secret: process.env.AUTH_SECRET,
  providers,
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user && hasRole(user)) {
        token.id = user.id;
        token.role = (user as User).role;
        token.email = (user as User).email;
        token.name = (user as User).name;
      }

      if (trigger === 'update') {
        token.image = session.user.image;
        token.name = session.user.name;
      }

      return token;
    },
    async session({ session, token }) {
      if (token && hasRole(token)) {
        session.user.id = token.id as string;
        session.user.role = token.role as UserRole;
      }

      session.user.email = token.email as string;

      if (token.image) {
        session.user.image = token.image as string;
      }

      if (token.name) {
        session.user.name = token.name as string;
      }

      return session;
    },
  },
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/login',
    signOut: '/logout',
    newUser: '/signup',
  },
});
