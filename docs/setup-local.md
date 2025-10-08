# SeaNotes - Local Development Setup Guide

This guide explains how to set up the **SeaNotes SaaS Starter Kit** locally for development and testing.  
You can run the app **without external services** like DigitalOcean Spaces, Resend, or Stripe.

---

## **1. Prerequisites**

Before you start, make sure you have:

- **Node.js** v20+ and **npm**  
- **Docker** (for running PostgreSQL locally)  
- **Git**  

---

## **2. Clone the Repository**

Clone your fork or the main repo and navigate to the application folder:

```bash
# Clone your fork (replace <your-username>)
git clone https://github.com/<your-username>/sea-notes-saas-starter-kit.git


# Navigate into the application folder
cd sea-notes-saas-starter-kit/application

# Install the dependencies
npm install

# Run the server
npm run dev

