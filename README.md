# SeaNotes – Advanced SaaS Starter Kit built with DigitalOcean

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-336791)](https://www.postgresql.org/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748)](https://www.prisma.io/)
[![Stripe](https://img.shields.io/badge/Stripe-Payment-6772e5)](https://stripe.com/)
[![Resend](https://img.shields.io/badge/Resend-Email-24292F)](https://resend.com/)
[![DigitalOcean](https://img.shields.io/badge/DigitalOcean-Ready-0080FF)](https://www.digitalocean.com/)
[![DO Spaces](https://img.shields.io/badge/DO%20Spaces-Storage-0080FF)](https://www.digitalocean.com/products/spaces/)

![alt text](docs/images/starter_kit_integrations.png)

**SeaNotes** is an Advanced SaaS Starter Kit — a production-ready notes app built with modern tools and fully integrated with DigitalOcean services. Now featuring advanced analytics, real-time collaboration, performance monitoring, and enhanced developer experience.

## 🚀 New Advanced Features

### 📊 Analytics & Monitoring
- **Advanced Analytics Dashboard** - Real-time user metrics and performance insights
- **Performance Monitoring** - Component render times and API call tracking  
- **Cache Management** - LRU cache with TTL for optimal performance

### 🔔 Real-time Features
- **Live Notifications** - Real-time notification system with multiple types
- **Collaboration Tools** - Multi-user editing with live cursors and presence
- **Advanced Search** - Fuzzy search with filters and highlighting

### 🛠️ Developer Experience
- **Enhanced CI/CD** - Comprehensive GitHub Actions workflow
- **Performance Testing** - Lighthouse CI integration
- **Security Scanning** - Automated vulnerability detection
- **Git Hooks** - Pre-commit linting and formatting

### ⚡ Performance Optimizations
- **Advanced Caching** - Multi-layer caching with intelligent eviction
- **Docker Optimization** - Multi-stage builds for production
- **Bundle Analysis** - Webpack bundle analyzer integration

This repository gives you everything you need to build and launch a real SaaS app on DigitalOcean App Platform. It’s designed to help you get started fast — whether you’re developing locally or deploying to the cloud. SeaNotes includes a complete implementation of a notes app to show how common SaaS features like auth, billing, and storage come together using DO’s infrastructure.

SeaNotes comes pre-integrated with:
- **Stripe** for subscription billing and payments
- **Resend** for transactional emails
- **DigitalOcean Spaces** for file storage
- **PostgreSQL** for database
- **One-click deployment** to DigitalOcean App Platform

You can use SeaNotes in two ways:
1. As a **starter kit** to build your own SaaS application by replacing the notes functionality with your business logic
2. As a **reference app** by pointing your LLMs (like ChatGPT or Claude) to this codebase to understand how to implement similar features in your own projects

![alt text](docs/images/application-preview.png)

## Quick Deploy

Want to try it out right away? Deploy SeaNotes to DigitalOcean App Platform in one click:

[![Deploy to DigitalOcean](https://www.deploytodo.com/do-btn-blue.svg)](https://cloud.digitalocean.com/apps/new?repo=https://github.com/digitalocean/sea-notes-saas-starter-kit/tree/main)

## What's Included

This is a production-ready SaaS Starter Kit for developers who want to build and launch real products quickly. It includes:

- ✅ Built-in login/auth with NextAuth  
- ✅ Forgot password + magic link login  
- ✅ Email notifications via Resend.com (with PDF invoice attachments)  
- ✅ Stripe billing (upgrade/cancel plan)  
- ✅ File uploads to DigitalOcean Spaces  
- ✅ PostgreSQL via Prisma ORM  
- ✅ Next.js + Material UI frontend  
- ✅ DigitalOcean GradientAI Serverless Inference API 
- ✅ Admin dashboard for managing users and subscriptions 
- ✅ One-click deploy to DO App Platform

SeaNotes is both a clean, flexible starting point for your own SaaS and a real-world example of best practices, and how all the core pieces fit together on DigitalOcean.

The included notes app functionality serves as a practical example of how to build business logic on top of this foundation. It also works really well with tools like ChatGPT or Claude. You can literally point your LLM at this repo and say:

> "Build me something like this, but for [my idea]"  

....and it'll scaffold your app using similar patterns — auth, billing, storage, GradientAI Serverless Inference API, etc., all running on DigitalOcean.

## Technical Stack

![Architecture Diagram](./docs/images/do-architecture-diagram.drawio.png)

- **Frontend**: Next.js, React, Material UI
- **Backend**: Next.js API routes
- **Database**: PostgreSQL (via Prisma ORM)
- **Authentication**: Next-Auth
- **Email**: Resend.com
- **File Storage**: DigitalOcean Spaces
- **Payments**: Stripe
- **AI**: DigitalOcean GradientAI Serverless Inference API
- **Deployment**: DigitalOcean App Platform

## Who It's For

- Indie hackers
- Solo devs
- Early-stage startup teams
- Developers validating an idea
- Anyone looking to build fast with best practices baked in

## Get Started

SeaNotes can be run [locally](#quick-start-local-development) or on [DigitalOcean App Platform](#part-5-deploy-to-digitalocean-app-platform). Follow the steps for each case below.

> **Important**: The app works out of the box with basic authentication and signup. However, to enable full functionality:
>
> - Email features (verification emails, password reset, magic links) require [Resend configuration](#part-2-set-up-email-provider-resend)
> - File uploads require [DigitalOcean Spaces setup](#part-3-set-up-file-storage-digitalocean-spaces)
> - Subscription features require [Stripe configuration](#part-4-set-up-stripe-for-billing-and-subscriptions)

## Quick Start (Local Development)

### Step 1: Get the Code

We recommend **forking** this repository to your own GitHub account before cloning, so your changes are saved in your own repo and you can still pull updates from the upstream project later.

```bash
# 1. Fork the repo to your GitHub account (button in the top right on GitHub)
# 2. Clone your fork locally:
git clone https://github.com/<your-username>/sea-notes-saas-starter-kit.git

cd sea-notes-saas-starter-kit/application
npm install
```

### Step 2: Create Your Environment File

Copy the example environment file to create your own configuration:

```bash
cp env-example .env
```

The `.env` file contains all the configuration settings for your application. The default values will work for basic local development, but you'll need to update them for additional features like email, file storage, and payments.

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

The basic version of SeaNotes is now set up locally on your computer! You can start exploring and playing around with the app right away:

1. **Sign up** for a new account

   - Fill in your email and password
   - After submitting, you'll see a confirmation message directly on the webpage (not via email)

2. **Log in** with your new credentials

   - You'll see a dashboard. This starter kit is built as a simple note-taking app, so you can:
     - **Create notes** (this is the main business logic included)
     - Edit or delete your notes
   - Try toggling **dark mode/light mode**
   - Go to your **profile** and try updating your profile details
   - **Log out** and log back in

3. **Create your first note**

   - Navigate to the **My Notes** section in the dashboard
   - Click the **Add Note** button
   - Enter a title and content for your note
   - Click **Save** to create your note
   - Try editing or deleting the note you created

![alt text](docs/images/saas_app_create_note_interface.png)

4. **Check the System Status Page**
   - Navigate to [http://localhost:3000/system-status](http://localhost:3000/system-status) to see if all required services are correctly configured
   - We've built this helpful service status page to show you at a glance if any service (like email or file storage) is misconfigured or missing credentials
   - This makes it easy to spot and fix issues before going live

![alt text](docs/images/system_status_page_screenshot.png)

> **Note:** Email and file storage are not set up by default. Configure these features using the documentation below.

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

## Part 3: Set Up File Storage (DigitalOcean Spaces)

Most SaaS apps need a way to store user files—like profile images, uploads, or documents. SeaNotes uses DigitalOcean Spaces for file storage, which is a scalable, S3-compatible solution. For example, the profile image feature in this kit is designed to work with a Spaces bucket out of the box.

To enable file uploads, you'll need to set up a DigitalOcean Spaces bucket and add your credentials to your `.env` file.

### Steps:

1. **Create a Spaces Bucket**
   - Log in to your [DigitalOcean dashboard](https://cloud.digitalocean.com/)
   - Click on **Spaces Object Storage**
   - Click **Create a Spaces Bucket**
   ![alt text](docs/images/digitalocean_spaces_object_storage.png)
   - Choose a region close to your users (e.g., nyc3 for New York)
   - Name your Space (e.g., `sea-notes-demo-bucket`)
   - This will create your bucket available at a URL like `https://sea-notes-demo-bucket.nyc3.digitaloceanspaces.com`


2. **Generate Access Keys**
   - Open your Space, click **Settings**, and scroll down to **Access Keys**
   - Click **Create Access Key** 
   ![alt text](docs/images/digitalocean_spaces_storage_settings.png)
   - Set permissions to **Full Access**, so your app can read, write, and delete files
   - Name the key (e.g., `sea-notes-demo-access-key`) and click **Create Access Key**
   - **Important:** Save the Access Key and Secret Key—this is the only time you'll see the Secret Key!
   ![alt text](docs/images/digitalocean_create_access_key.png)

3. **Get Your Spaces Values for Environment Variables**

   After creating your Spaces bucket and access key, you'll need to add the following values to your `.env` file:

   - **SPACES_REGION**: This is your selected datacenter region (e.g., nyc3, sfo2, etc.)

   - **SPACES_BUCKET_NAME**: This is simply the name you gave your Spaces bucket when you created it

   - **SPACES_KEY_ID**: This is the Access Key ID you received when creating your access key

   - **SPACES_SECRET_KEY**: This is the Secret Access Key you received when creating your access key

   The image below shows where to find the Access Key ID and Secret Access Key values after creating them:

![Access Key Information](./docs/images/access_key_information_screenshot.png)

4. **Update Your `.env` File**
   Add these lines (replace with your actual values):

   ```
   SPACES_REGION=your-space-region (nyc3, sfo2, etc.)
   SPACES_BUCKET_NAME=your-space-name
   SPACES_KEY_ID=your-access-key
   SPACES_SECRET_KEY=your-secret-key
   ```

   - The endpoint will match your region (e.g., `nyc3`, `sfo2`, etc.)

5. **Restart Your Development Server**

   - After updating your `.env`, restart the server:

     ```bash
     npm run dev
     ```

6. **Check the System Status Page**

   - After setting up your Spaces credentials, visit [http://localhost:3000/system-status](http://localhost:3000/system-status) to confirm that file storage is correctly configured and connected

7. **Try Uploading a Profile Image**

   - Go to your profile/settings page in the app
   - Try uploading a profile image to make sure everything is working as expected
   - If you encounter any errors, check the system status page for more details and troubleshooting tips

> For more details, see [DigitalOcean's Spaces documentation](https://docs.digitalocean.com/products/spaces/).

## Part 4: Set Up Stripe for Billing and Subscriptions

SeaNotes includes a complete subscription billing system powered by Stripe. Setting up Stripe allows you to:

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

## Part 5: Set Up AI Features (DigitalOcean Inference API)

SeaNotes includes AI-powered features that enhance the note-taking experience using DigitalOcean's Inference API. These features are completely optional - your app works perfectly without them, but they add intelligent automation when enabled.

### AI Features Included:

- **AI Integration Demo** - Users can click "Generate Note with AI" to see how DigitalOcean's Inference API works (demonstrates AI integration patterns)
- **Automatic Title Generation** - When users create notes without titles, the system generates relevant titles in the background
- **Graceful Fallbacks** - If AI services are unavailable, the app continues working normally with timestamp-based titles

### Setup Steps:

1. **Get Your DigitalOcean Inference API Key**

   - Log in to your [DigitalOcean dashboard](https://cloud.digitalocean.com/)
   - Navigate to **Agent Platform** in the left sidebar → click **Serverless Inference**
   ![digitalocean_agent_platform_interface](docs/images/digitalocean_agent_platform_interface.png)
   - Click the **"Create model access key"** button
   - Give your key a descriptive name (e.g., "my-saas-app-ai-key")
   ![add_model_access_key_screenshot](docs/images/add_model_access_key_screenshot.png)
   - Click **Save** and copy the generated key immediately
   ![alt text](docs/images/model_access_keys_digitalocean.png)
   - Store this key securely - you'll need it for your environment configuration
   

   > **Note:** This single key provides access to all models in DigitalOcean's Serverless Inference service.

2. **Update Your `.env` File**
   
   Update the following values in your `.env` file with your actual API key:

   ```
   DO_INFERENCE_API_KEY=your-digitalocean-inference-api-key
   NEXT_PUBLIC_DIGITALOCEAN_GRADIENTAI_ENABLED=true
   ```

   - `DO_INFERENCE_API_KEY`: Your DigitalOcean Inference API key (server-side)
   - `NEXT_PUBLIC_DIGITALOCEAN_GRADIENTAI_ENABLED`: Enables DigitalOcean Gradient AI features in the frontend (client-side)

3. **Restart Your Development Server**

   After updating your `.env`, restart the server:

   ```bash
   npm run dev
   ```

4. **Test the AI Features**

   - **Content Generation**: When creating a new note, look for the "Generate Note with AI" button
   - **Auto-Title Generation**: Create a note without a title and watch as an AI-generated title appears automatically
   - **System Status**: Check [http://localhost:3000/system-status](http://localhost:3000/system-status) to confirm AI services are connected

### How It Works:

- **User-Triggered**: Content generation only happens when users click the AI button
- **Background Processing**: Title generation happens automatically but doesn't block note creation
- **Smart Fallbacks**: If AI generation fails, the app uses timestamp-based titles instead
- **No Dependencies**: Your app continues to work normally even if AI features are disabled

> **Note:** AI features use DigitalOcean's managed inference service, which provides reliable AI capabilities without the need to manage your own AI infrastructure.

## Part 6: Deploy to DigitalOcean App Platform

SeaNotes is designed to deploy seamlessly to DigitalOcean App Platform. You have two options for deployment:

### Option A: Deploy with One-Click Deployment Button

1. Click on the one-click deployment button below. If you are not currently logged in with your DigitalOcean account, this button prompts you to log in.

[![Deploy to DigitalOcean](https://www.deploytodo.com/do-btn-blue.svg)](https://cloud.digitalocean.com/apps/new?repo=https://github.com/digitalocean/sea-notes-saas-starter-kit/tree/main)

2. After deployment is complete, configure the environment variables under Settings -> saas-application.
   - DATABASE_URL: is automatically populated, but if you want to use a DigitalOcean Managed DB, replace the connection string value.

> Note: Prisma migrations will run automatically

3. Navigate to the site to verify your deployment

### Option B: Manual Deployment

1. **Prepare Your Application**

   - Make sure all required environment variables are set
   - Ensure your database is properly configured
   - Test your application locally to confirm everything works

2. **Deploy to DigitalOcean**

   - Follow the detailed instructions in our [DigitalOcean Deployment Guide](docs/digitalocean-deployment-guide.md)
   - The guide covers creating resources, configuring environment variables, and setting up your app

3. **Verify Your Deployment**
   - After deployment, check the system status page on your live site
   - Test all features to ensure they're working correctly in production

For detailed deployment instructions, see the [DigitalOcean Deployment Guide](docs/digitalocean-deployment-guide.md).

## License

This repository is covered under [The MIT License](LICENSE).
