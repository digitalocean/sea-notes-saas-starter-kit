# RPaaS – Robotics Platform as a Service Starter Kit

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-336791)](https://www.postgresql.org/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748)](https://www.prisma.io/)
[![Stripe](https://img.shields.io/badge/Stripe-Payment-6772e5)](https://stripe.com/)
[![Resend](https://img.shields.io/badge/Resend-Email-24292F)](https://resend.com/)
[![DigitalOcean](https://img.shields.io/badge/DigitalOcean-Ready-0080FF)](https://www.digitalocean.com/)

![alt text](docs/images/starter_kit_integrations.png)

**RPaaS** is a Robotics Platform as a Service Starter Kit — a simple, production-ready web application that allows users to launch and manage cloud-based robotics development environments. It's built with modern tools and fully integrated with DigitalOcean services.

This repository gives you everything you need to build and launch a real SaaS app on DigitalOcean App Platform. It’s designed to help you get started fast — whether you’re developing locally or deploying to the cloud. RPaaS includes a complete implementation of a robotics environment management system to show how common SaaS features like auth, billing, and resource management come together using DO’s infrastructure.

RPaaS comes pre-integrated with:
- **Stripe** for subscription billing and payments
- **Resend** for transactional emails
- **PostgreSQL** for database
- **One-click deployment** to DigitalOcean App Platform

You can use RPaaS in two ways:
1. As a **starter kit** to build your own robotics platform by extending the existing functionality.
2. As a **reference app** by pointing your LLMs (like ChatGPT or Claude) to this codebase to understand how to implement similar features in your own projects

![alt text](docs/images/application-preview.png)

## Quick Deploy

Want to try it out right away? Deploy RPaaS to DigitalOcean App Platform in one click:

[![Deploy to DigitalOcean](https://www.deploytodo.com/do-btn-blue.svg)](https://cloud.digitalocean.com/apps/new?repo=https://github.com/Omar-Belghaouti/rpaas-starter/tree/main)

## What's Included

This is a production-ready SaaS Starter Kit for developers who want to build and launch real products quickly. It includes:

- ✅ Built-in login/auth with NextAuth  
- ✅ Forgot password + magic link login  
- ✅ Email notifications via Resend.com (with PDF invoice attachments)  
- ✅ Stripe billing (upgrade/cancel plan)  
- ✅ PostgreSQL via Prisma ORM  
- ✅ Next.js + Material UI frontend  
- ✅ Admin dashboard for managing users and subscriptions 
- ✅ One-click deploy to DO App Platform

RPaaS is both a clean, flexible starting point for your own SaaS and a real-world example of best practices, and how all the core pieces fit together on DigitalOcean.

The included robotics environment management functionality serves as a practical example of how to build business logic on top of this foundation. It also works really well with tools like ChatGPT or Claude. You can literally point your LLM at this repo and say:

> "Build me something like this, but for [my idea]"  

....and it'll scaffold your app using similar patterns — auth, billing, etc., all running on DigitalOcean.

## Technical Stack

![Architecture Diagram](./docs/images/do-architecture-diagram.drawio.png)

- **Frontend**: Next.js, React, Material UI
- **Backend**: Next.js API routes
- **Database**: PostgreSQL (via Prisma ORM)
- **Authentication**: Next-Auth
- **Email**: Resend.com
- **Payments**: Stripe
- **Deployment**: DigitalOcean App Platform

## Who It's For

- Indie hackers
- Solo devs
- Early-stage startup teams
- Developers validating an idea
- Anyone looking to build fast with best practices baked in

## Get Started

RPaaS can be run [locally](#quick-start-local-development) or on [DigitalOcean App Platform](#part-5-deploy-to-digitalocean-app-platform). Follow the steps for each case below.

> **Important**: The app works out of the box with basic authentication and signup. However, to enable full functionality:
>
> - Email features (verification emails, password reset, magic links) require [Resend configuration](#part-2-set-up-email-provider-resend)
> - Subscription features require [Stripe configuration](#part-4-set-up-stripe-for-billing-and-subscriptions)

## Quick Start (Local Development)

### Step 1: Get the Code

We recommend **forking** this repository to your own GitHub account before cloning, so your changes are saved in your own repo and you can still pull updates from the upstream project later.

```bash
# 1. Fork the repo to your GitHub account (button in the top right on GitHub)
# 2. Clone your fork locally:
git clone https://github.com/Omar-Belghaouti/rpaas-starter.git

cd rpaas-starter/application
npm install
```

### Step 2: Create Your Environment File

Copy the example environment file to create your own configuration:

```bash
cp env-example .env
```

The `.env` file contains all the configuration settings for your application. The default values will work for basic local development, but you'll need to update them for additional features like email and payments.

### Step 3: Set Up Your Database

#### Option A: Use Docker for PostgreSQL (Recommended for Development)

If you prefer using Docker for your database, follow these steps:

1. **Install Docker**

   - If you don't already have Docker installed, download and install [Docker Desktop](https://www.docker.com/products/docker-desktop/)
   - Make sure Docker is running on your system before proceeding

2. **Start the PostgreSQL Container**

   From the project root, run:

   ```bash
   cd application
   docker-compose up -d
   ```

   This will start a PostgreSQL container with the default configuration:
   - Database name: `saas_kit_db`
   - Username: `postgres` 
   - Password: `postgres`
   - Port: `5432`

   The Docker Compose configuration already includes these sensible defaults, so no changes are needed to the database configuration in your `.env` file for basic setup.

   ![alt text](docs/images/docker_desktop_containers_view.png)

#### Option B: Use an Existing Cloud Database (e.g., DigitalOcean)

If you already have a PostgreSQL database hosted in the cloud, you can use that instead:

1. **Update Your Database Connection**

   Edit your `.env` file and update the `DATABASE_URL` to your cloud database connection string:

   ```
   DATABASE_URL=postgresql://username:password@host:port/database
   ```

   For a DigitalOcean managed PostgreSQL database, you can find this connection string in your database's Connection Details tab:

   ![DigitalOcean PostgreSQL Connection Details](docs/images/digitalocean_postgresql_connection_details.png)

2. For guidance on setting up a cloud database:
   - [How to create a DigitalOcean database](./docs/creating-database-digitalocean.md)
   - [How to get your DigitalOcean database connection string](https://docs.digitalocean.com/products/databases/postgresql/how-to/connect/)

### Step 4: Initialize Your Database

With your database set up (either Docker or cloud), initialize the database tables:

```bash
npx prisma generate
npx prisma migrate deploy
```

This will create all the necessary tables and relationships in your database.

### Step 5: Start the Development Server

```bash
npm run dev
```

This command will start the development server and launch your application on port 3000.

Visit [http://localhost:3000](http://localhost:3000) in your browser.

![alt text](docs/images/launch_your_saas_on_digitalocean.png)

## First Things to Try

The basic version of RPaaS is now set up locally on your computer! You can start exploring and playing around with the app right away:

1. **Sign up** for a new account

   - Fill in your email and password
   - After submitting, you'll see a confirmation message directly on the webpage (not via email)

2. **Log in** with your new credentials

   - You'll see a dashboard. This starter kit is built as a simple robotics environment management app, so you can:
     - **Create environments** (this is the main business logic included)
     - Edit or delete your environments
   - Try toggling **dark mode/light mode**
   - Go to your **profile** and try updating your profile details
   - **Log out** and log back in

3. **Create your first environment**

   - Navigate to the **My Environments** section in the dashboard
   - Click the **Add Environment** button
   - Enter a name and type for your environment
   - Click **Save** to create your environment
   - Try editing or deleting the environment you created

![alt text](docs/images/saas_app_create_note_interface.png)

4. **Check the System Status Page**
   - Navigate to [http://localhost:3000/system-status](http://localhost:3000/system-status) to see if all required services are correctly configured
   - We've built this helpful service status page to show you at a glance if any service (like email or file storage) is misconfigured or missing credentials
   - This makes it easy to spot and fix issues before going live

![alt text](docs/images/system_status_page_screenshot.png)

> **Note:** Email functionality is not set up by default. Configure this feature using the documentation below.

## Part 2: Set Up Email Provider (Resend)

By default, email functionality is disabled for local development, allowing you to sign up and log in without setting up an email provider. However, features like password reset and magic links won't work until email is configured.

This starter kit comes with [Resend](https://resend.com) integration built-in. All you need to do is get your API key and a verified sender email address from Resend, and add them to your `.env` file.

### Email Features

The Resend integration supports:
- **Transactional emails**: Signup verification, password reset, magic links
- **Invoice generation with PDF attachments**: Automatically generates and attaches PDF invoices to billing emails
- **React-based email templates**: Consistent styling using React Email components

> **Note on Attachments**: The email service uses local (in-memory) attachments. PDFs and other files are generated on-the-fly as Buffer objects and attached directly to emails. Files are not saved to disk or fetched from external URLs. This approach ensures fast, secure attachment handling without requiring external storage.

### Steps:

1. **Create a Resend Account**

   - Go to [Resend](https://resend.com/) and sign up for a free account

2. **Get Your API Key**

   - In the Resend dashboard, go to the [API Keys](https://resend.com/api-keys) section
   - Click "Create API Key" and copy the generated key
   - Set permissions to "Full Access" and select your domain (or all domains)
   - Store this key securely - you'll need it for your `.env` file

![alt text](docs/images/resend_api_keys_dashboard.png)

3. **Configure Sender Address (Two Options)**

   **Option A: Use Resend Test Address (Quick Start)**

   - Use `delivered@resend.dev` as your sender address
   - Note: This only allows sending emails to the account that created the API key
   - Perfect for initial testing but not for production use

   **Option B: Add and Verify Your Own Domain (Recommended for Production)**

   - In the Resend dashboard, go to the [Domains](https://resend.com/domains) section
   - Click "Add Domain" and enter your domain name
   - Follow the DNS verification steps provided to verify ownership of your domain
   - Once verified, you can use any email address at that domain as your sender (e.g., `noreply@yourdomain.com`)
   - Note: Free accounts can configure up to one domain
   - For detailed instructions on domain setup, see [Resend's official domain documentation](https://resend.com/docs/dashboard/domains/introduction)

4. **Update Your `.env` File**
   Add these lines (replace with your actual values):

   ```
   ENABLE_EMAIL_INTEGRATION=true
   RESEND_API_KEY=your-resend-api-key
   RESEND_EMAIL_SENDER=delivered@resend.dev  # Or your verified domain email
   ```

5. **Restart Your Development Server**

   - After updating your `.env`, restart the server:

     ```bash
     npm run dev
     ```

6. **Test Email Sending**

   - Try signing up for a new account or using the password reset feature
   - Check your inbox for the verification or reset email
   - You can also check the system status page to confirm Resend is connected
   ![alt text](docs/images/gmail_verify_email_screenshot.png)

## Part 3: Set Up Stripe for Billing and Subscriptions

RPaaS includes a complete subscription billing system powered by Stripe. Setting up Stripe allows you to:

- Offer free and paid subscription tiers
- Process payments securely
- Let users manage their subscriptions
- Handle subscription lifecycle events automatically

### Quick Setup Steps:

1. **Create a Stripe Account**

   - Sign up for a free account at [Stripe](https://dashboard.stripe.com/register)

2. **Get Your API Keys**

   - In your Stripe dashboard, switch to Test mode
   - Go to Developers → API keys
   - Copy your Secret Key (starts with `sk_test_...`)

3. **Run the Automated Setup Script**

   ```bash
   npm run setup:stripe
   ```

   This script will:

   - Create subscription products (Free and Pro plans)
   - Set up pricing tiers
   - Configure the customer portal
   - Add all necessary keys to your `.env` file

4. **Configure Webhooks**

   - For local development, use the Stripe CLI (recommended) or ngrok
   - For production, set up webhooks in your Stripe dashboard

5. **Test the Integration**

   - Try signing up for a paid plan
   - Test upgrading/downgrading subscriptions
   - Verify subscription status changes are reflected in your app

> **Note:** For detailed instructions, including webhook setup, adding custom products, and troubleshooting, see the [Stripe Integration Guide](./docs/stripe-integration-guide.md).

## Part 3: Set Up Stripe for Billing and Subscriptions
