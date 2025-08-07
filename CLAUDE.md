# Claude Memory File

This file contains information to help Claude remember important details about your codebase and preferences.

## Project Overview

SeaNotes is a Next.js 15 SaaS application with TypeScript, featuring user authentication, subscription management, and a notes system. The application uses a service-oriented architecture with comprehensive testing coverage.

## Technology Stack

- **Frontend**: Next.js 15 with TypeScript, Material-UI components
- **Authentication**: NextAuth.js with role-based access (USER/ADMIN)
- **Database**: PostgreSQL with Prisma ORM
- **Billing**: Stripe integration with FREE/PRO subscription plans
- **Email**: Resend service for transactional emails
- **Storage**: DigitalOcean Spaces (AWS S3 compatible)
- **Testing**: Jest with React Testing Library

## Commands

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build production application
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting
- `npm run test` - Run client-side tests
- `npm run test:server` - Run server-side tests
- `npm run test:all` - Run all tests
- `npm run setup:stripe` - Configure Stripe integration
- `npm run setup:deploy` - Generate deployment configuration
- `npm run deploy` - Deploy to DigitalOcean
- `docker-compose up -d` - Start PostgreSQL container for local development

## Database

- **ORM**: Prisma with PostgreSQL
- **Migration Command**: `npx prisma migrate dev`
- **Schema Location**: `prisma/schema.prisma`
- **Local Development**: Use `docker compose up` to start PostgreSQL container

## Code Style Preferences

- **Language**: TypeScript
- **Framework**: Next.js with App Router
- **UI Library**: Material-UI (MUI)
- **Testing**: Jest with comprehensive test coverage
- **Architecture**: Service factories with dependency injection

## Codebase Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (protected)/        # Protected routes (requires auth)
│   ├── (public)/          # Public routes
│   └── api/               # API routes
├── components/            # React components organized by feature
├── lib/                   # Utility libraries and configurations
├── services/              # Business logic services with factories
├── context/               # React context providers
├── hooks/                 # Custom React hooks
└── helpers/               # Utility functions
```

## Key Features

- **Authentication**: Email/password with magic link support
- **User Management**: Profile updates, password changes, email verification
- **Subscriptions**: Stripe integration with FREE/PRO plans
- **Notes System**: CRUD operations for user notes
- **Admin Dashboard**: User management interface
- **System Status**: Service health monitoring
- **Theming**: Multiple UI themes with user selection

## Environment Variables

Key environment variables (see `env-example`):

- `DATABASE_URL` - PostgreSQL connection string
- `NEXTAUTH_SECRET` - NextAuth.js secret
- `STRIPE_SECRET_KEY` - Stripe API key
- `RESEND_API_KEY` - Email service API key
- `SPACES_*` - DigitalOcean Spaces configuration
- `SEANOTES_SPACES_*` - DigitalOcean Spaces configuration

## Testing Strategy

- Unit tests for components and services
- API route testing with mocked dependencies
- Separate Jest configurations for client and server tests
- Test files co-located with source files using `.test.ts(x)` extension

## Deployment

- DigitalOcean App Platform ready
- Custom deployment scripts in `setup/` directory
- Docker support with PostgreSQL service
- Environment-based configuration switching
