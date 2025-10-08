
# SeaNotes – SaaS Starter Kit built with DigitalOcean

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-336791)](https://www.postgresql.org/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748)](https://www.prisma.io/)
[![Stripe](https://img.shields.io/badge/Stripe-Payment-6772e5)](https://stripe.com/)
[![Resend](https://img.shields.io/badge/Resend-Email-24292F)](https://resend.com/)
[![DigitalOcean](https://img.shields.io/badge/DigitalOcean-Ready-0080FF)](https://www.digitalocean.com/)
[![Hacktoberfest](https://img.shields.io/badge/Hacktoberfest-Friendly-blueviolet)](https://hacktoberfest.com/)
[![Community](https://img.shields.io/badge/Open%20Source-Contribution-green)](https://github.com/digitalocean)

---

## 📘 Table of Contents
- [Overview](#overview)
- [Quick Deploy](#quick-deploy)
- [What's Included](#whats-included)
- [Technical Stack](#technical-stack)
- [Who It's For](#who-its-for)
- [Quick Start (Local Development)](#quick-start-local-development)
- [Set Up Email Provider (Resend)](#part-2-set-up-email-provider-resend)
- [Set Up File Storage (DigitalOcean Spaces)](#part-3-set-up-file-storage-digitalocean-spaces)
- [Set Up Stripe for Billing and Subscriptions](#part-4-set-up-stripe-for-billing-and-subscriptions)
- [Set Up AI Features (DigitalOcean Inference API)](#part-5-set-up-ai-features-digitalocean-inference-api)
- [Deploy to DigitalOcean App Platform](#part-6-deploy-to-digitalocean-app-platform)
- [Contributing](#contributing)
- [Acknowledgements](#acknowledgements)
- [License](#license)

---

## 🧭 Overview

**SeaNotes** is a SaaS Starter Kit — a production-ready notes app built with modern tools and fully integrated with DigitalOcean services.  
It provides everything you need to build, launch, and scale your SaaS product quickly using proven best practices.

SeaNotes comes pre-integrated with:
- **Stripe** for billing and subscriptions
- **Resend** for transactional emails
- **DigitalOcean Spaces** for file storage
- **PostgreSQL** with Prisma ORM
- **AI integration** via DigitalOcean Inference API
- **One-click deployment** to DigitalOcean App Platform

You can use SeaNotes as:
1. A **starter kit** to build your own SaaS product  
2. A **reference app** for understanding production-ready SaaS architecture  

---

## 🚀 Quick Deploy

Deploy SeaNotes instantly on DigitalOcean App Platform:

[![Deploy to DigitalOcean](https://www.deploytodo.com/do-btn-blue.svg)](https://cloud.digitalocean.com/apps/new?repo=https://github.com/digitalocean/sea-notes-saas-starter-kit/tree/main)

---

## 📦 What's Included
- ✅ Authentication via **NextAuth**
- ✅ Stripe-based subscription billing
- ✅ File uploads via **DigitalOcean Spaces**
- ✅ Email integration using **Resend**
- ✅ Admin dashboard for managing users
- ✅ AI note generation powered by **DigitalOcean GradientAI**
- ✅ Full PostgreSQL setup with Prisma
- ✅ Next.js + Material UI frontend

---

## 🧱 Technical Stack

![Architecture Diagram](./docs/images/do-architecture-diagram.drawio.png)

**Frontend:** Next.js, React, Material UI  
**Backend:** Next.js API Routes  
**Database:** PostgreSQL with Prisma ORM  
**Auth:** NextAuth  
**Email:** Resend  
**Storage:** DigitalOcean Spaces  
**Payments:** Stripe  
**AI:** GradientAI Serverless Inference  
**Deployment:** DigitalOcean App Platform  

---

## 👨‍💻 Who It's For
- Indie hackers & startup founders  
- Full-stack developers building SaaS  
- Early-stage product teams  
- Developers learning cloud architecture  

---

## 🧰 Quick Start (Local Development)

### Step 1: Fork & Clone
```bash
git clone https://github.com/<your-username>/sea-notes-saas-starter-kit.git
cd sea-notes-saas-starter-kit/application
npm install
````

### Step 2: Configure Environment

```bash
cp env-example .env
```

### Step 3: Initialize Database

```bash
npx prisma generate
npx prisma migrate deploy
```

### Step 4: Run the App

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)
![SeaNotes Dashboard Interface](docs/images/application-preview.png)

---

## 📧 Part 2: Set Up Email Provider (Resend)

1. Create a [Resend Account](https://resend.com/)
2. Generate an API key and update `.env`:

```bash
ENABLE_EMAIL_INTEGRATION=true
RESEND_API_KEY=your-resend-api-key
RESEND_EMAIL_SENDER=delivered@resend.dev
```

3. Restart the app and test signup or password reset emails.

---

## 📂 Part 3: Set Up File Storage (DigitalOcean Spaces)

1. Create a Space in your [DigitalOcean dashboard](https://cloud.digitalocean.com/)
2. Add credentials in `.env`:

```bash
SPACES_REGION=nyc3
SPACES_BUCKET_NAME=sea-notes-demo
SPACES_KEY_ID=your-key
SPACES_SECRET_KEY=your-secret
```

3. Restart and test file uploads (e.g. profile images).

---

## 💳 Part 4: Set Up Stripe Billing

1. Sign up for [Stripe](https://dashboard.stripe.com/)
2. Run:

```bash
npm run setup:stripe
```

3. Test subscriptions and payment flows.

---

## 🧠 Part 5: Set Up AI Features (DigitalOcean Inference API)

1. Get your API key from [DigitalOcean GradientAI](https://cloud.digitalocean.com/)
2. Add to `.env`:

```bash
DO_INFERENCE_API_KEY=your-digitalocean-ai-key
NEXT_PUBLIC_DIGITALOCEAN_GRADIENTAI_ENABLED=true
```

3. Try “Generate Note with AI” in your dashboard.

---

## ☁️ Part 6: Deploy to DigitalOcean App Platform

Use the one-click deploy button or follow the [Deployment Guide](docs/digitalocean-deployment-guide.md)
After deployment, verify services using the **System Status** page.

---

## 🤝 Contributing

We welcome open-source contributions!
Follow these steps to contribute:

1. **Fork** this repo
2. **Create a branch**

   ```bash
   git checkout -b feature/your-feature
   ```
3. **Commit and Push**

   ```bash
   git add .
   git commit -m "docs: improved README and contributing section"
   git push origin feature/your-feature
   ```
4. **Open a Pull Request**

✅ Be clear, concise, and keep commits meaningful

---

## 💖 Acknowledgements

Special thanks to **DigitalOcean** and the **open-source community** for supporting developers through **Hacktoberfest** and enabling projects like SeaNotes.

---

## 📜 License

Licensed under the [MIT License](LICENSE).


