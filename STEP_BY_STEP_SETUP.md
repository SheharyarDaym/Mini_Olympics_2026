# Step-by-Step Database Setup Guide

## Step 1: Create Neon Database Account

1. **Open your web browser** and go to: https://neon.tech
2. **Click "Sign Up"** (you can use GitHub, Google, or email)
3. **Create a new project**:
   - Click "Create Project"
   - Choose a project name (e.g., "mini-olympics")
   - Select a region (choose closest to you)
   - Click "Create Project"

## Step 2: Get Your Connection String

1. **In Neon Dashboard**, you'll see your project
2. **Click on "Connection Details"** or look for the connection string
3. **Copy the connection string** - it looks like:
   ```
   postgresql://username:password@ep-xxx-xxx.region.aws.neon.tech/neondb?sslmode=require
   ```

## Step 3: Configure env.local

Once you have the connection string, we'll add it to `env.local` along with your admin password.

## Step 4: Initialize Database

We'll run the initialization script to create all tables.

## Step 5: Create Admin User

We'll create your admin account.

## Step 6: Start the Application

We'll start the dev server and test everything.

---

**Ready?** Please provide:
1. Your Neon connection string (or let me know when you've created the account)
2. Your desired admin password

Or if you already have a PostgreSQL database, provide that connection string instead.
