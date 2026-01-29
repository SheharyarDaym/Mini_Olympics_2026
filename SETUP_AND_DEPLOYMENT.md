# Setup and Deployment Guide

This guide covers everything you need to set up the Mini Olympics registration system locally and deploy it to Vercel.

## 📋 Table of Contents
1. [System Requirements](#system-requirements)
2. [Local Development Setup](#local-development-setup)
3. [Database Setup (Neon/Postgres)](#database-setup-neonpostgres)
4. [Environment Variables](#environment-variables)
5. [Vercel Deployment](#vercel-deployment)
6. [Post-Deployment Configuration](#post-deployment-configuration)

---

## System Requirements

### Required Software

1. **Node.js** (v18 or higher)
   - Check: `node --version`
   - Install: [nodejs.org](https://nodejs.org/)

2. **npm** (comes with Node.js)
   - Check: `npm --version`

3. **PostgreSQL Client Tools** (for database scripts)
   - **Linux/Debian/Ubuntu**: `sudo apt-get install postgresql-client`
   - **macOS**: `brew install postgresql` or `brew install libpq`
   - **Windows**: Install [PostgreSQL](https://www.postgresql.org/download/windows/) (includes psql)

4. **Git** (for version control)
   - Check: `git --version`
   - Install: [git-scm.com](https://git-scm.com/)

### Optional but Recommended

- **Vercel CLI** (for easier deployment)
  - Install: `npm install -g vercel`

---

## Local Development Setup

### Step 1: Install Dependencies

```bash
cd /home/moin/Desktop/Mini-olympics
npm install
```

This will install all required packages from `package.json`:
- Next.js 14
- React 18
- Neon Database Serverless driver
- Drizzle ORM
- Nodemailer (for email)
- UI components (Radix UI, Tailwind CSS)
- And more...

### Step 2: Create Environment File

```bash
cp env.example env.local
```

Then edit `env.local` with your configuration (see [Environment Variables](#environment-variables) section).

### Step 3: Run Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

---

## Database Setup (Neon/Postgres)

### Option 1: Using Neon (Recommended for Serverless)

1. **Create a Neon Account**
   - Go to [neon.tech](https://neon.tech)
   - Sign up for a free account

2. **Create a New Project**
   - Click "Create Project"
   - Choose a name and region
   - Note your connection string (it looks like: `postgresql://user:password@host/database?sslmode=require`)

3. **Get Your Connection String**
   - In Neon dashboard, go to your project
   - Click "Connection Details"
   - Copy the connection string
   - Format: `postgresql://[user]:[password]@[host]/[database]?sslmode=require`

### Option 2: Using Standard PostgreSQL

1. **Set up PostgreSQL Database**
   - Install PostgreSQL locally or use a cloud provider (AWS RDS, DigitalOcean, etc.)
   - Create a new database
   - Get your connection string

2. **Connection String Format**
   ```
   postgresql://username:password@host:port/database?sslmode=require
   ```

### Initialize Database Schema

Once you have your `DATABASE_URL` set in `env.local`:

```bash
# Make the script executable (if not already)
chmod +x scripts/db.sh

# Initialize the database (creates all tables and seed data)
./scripts/db.sh init

# Verify the database was set up correctly
./scripts/db.sh verify

# Create an admin user
./scripts/db.sh create-admin admin your-secure-password
```

**Available Database Commands:**
- `./scripts/db.sh init` - Create all tables and seed initial data
- `./scripts/db.sh migrate` - Apply migrations to existing database
- `./scripts/db.sh verify` - Check database structure
- `./scripts/db.sh count` - Show registration counts
- `./scripts/db.sh test` - Test database connection
- `./scripts/db.sh seed-admin` - Create default admin user
- `./scripts/db.sh create-admin <username> <password> [role]` - Create/update admin user
- `./scripts/db.sh list-admins` - List all admin users
- `./scripts/db.sh reset --yes` - ⚠️ DESTRUCTIVE: Drop all tables

---

## Environment Variables

### Required Variables

Create `env.local` file (or `.env.local`) with:

```bash
# Database connection (REQUIRED)
# Neon example:
# DATABASE_URL=postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/dbname?sslmode=require
# Standard Postgres example:
# DATABASE_URL=postgresql://user:password@localhost:5432/miniolympics?sslmode=require
DATABASE_URL=your-database-connection-string-here

# Admin credentials (REQUIRED for production)
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your-secure-password-here
```

### Optional Variables

```bash
# Node environment (automatically set by Vercel in production)
NODE_ENV=production

# Next.js public variables (if needed)
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
```

### SMTP Settings (Configured via Admin Panel)

SMTP settings are stored in the database (`system_settings` table) and can be configured through the admin panel at `/admin/settings`. Required settings:

- `smtp_host` - SMTP server (e.g., `smtp.gmail.com`)
- `smtp_port` - SMTP port (e.g., `587` for TLS, `465` for SSL)
- `smtp_email` - Your email address
- `smtp_password` - Your email password or app-specific password
- `smtp_from_name` - Display name (e.g., "FCIT Sports Society")

**Note:** For Gmail, you'll need to:
1. Enable 2-factor authentication
2. Generate an "App Password" from your Google Account settings
3. Use the app password instead of your regular password

---

## Vercel Deployment

### Prerequisites

1. **Vercel Account**
   - Sign up at [vercel.com](https://vercel.com)
   - Connect your GitHub/GitLab/Bitbucket account (recommended)

2. **Git Repository**
   - Push your code to GitHub/GitLab/Bitbucket
   - Or use Vercel CLI for direct deployment

### Method 1: Deploy via Vercel Dashboard (Recommended)

1. **Import Project**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Import your Git repository
   - Or upload your project folder

2. **Configure Project**
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `./` (default)
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `.next` (default)
   - **Install Command**: `npm install` (default)

3. **Set Environment Variables**
   In Vercel dashboard, go to your project → Settings → Environment Variables:
   
   Add these variables:
   ```
   DATABASE_URL = your-neon-or-postgres-connection-string
   ADMIN_USERNAME = admin
   ADMIN_PASSWORD = your-secure-password
   ```
   
   **Important:** 
   - Set these for **Production**, **Preview**, and **Development** environments
   - Use different passwords for production vs development

4. **Deploy**
   - Click "Deploy"
   - Wait for build to complete
   - Your app will be live at `https://your-project.vercel.app`

### Method 2: Deploy via Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   # First deployment (follow prompts)
   vercel
   
   # Production deployment
   vercel --prod
   ```

4. **Set Environment Variables via CLI**
   ```bash
   vercel env add DATABASE_URL
   vercel env add ADMIN_USERNAME
   vercel env add ADMIN_PASSWORD
   ```

### Vercel Configuration File (Optional)

Create `vercel.json` in the project root for custom configuration:

```json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "regions": ["iad1"]
}
```

---

## Post-Deployment Configuration

### Step 1: Initialize Database on Production

After deployment, you need to initialize the database schema. You have two options:

**Option A: Using Vercel CLI (Recommended)**
```bash
# Set environment variables locally for one-time use
export DATABASE_URL="your-production-database-url"

# Run init script
./scripts/db.sh init

# Create admin user
./scripts/db.sh create-admin admin your-production-password
```

**Option B: Using Neon Dashboard SQL Editor**
1. Go to your Neon project dashboard
2. Open SQL Editor
3. Copy and paste the SQL from `scripts/init-db.sql`
4. Execute the SQL

**Option C: Create a One-Time API Endpoint**
You can create a temporary API route to initialize the database (remove after use for security).

### Step 2: Configure SMTP Settings

1. Log in to your admin panel: `https://your-app.vercel.app/admin/login`
   - Username: `admin` (or your configured username)
   - Password: Your admin password

2. Go to Settings: `https://your-app.vercel.app/admin/settings`

3. Scroll to "SMTP Configuration" section

4. Enter your SMTP settings:
   - **SMTP Host**: `smtp.gmail.com` (or your email provider)
   - **SMTP Port**: `587` (TLS) or `465` (SSL)
   - **SMTP Email**: Your email address
   - **SMTP Password**: Your email password or app password
   - **From Name**: Display name for emails

5. Click "Save Settings"

6. Test email configuration:
   - Go to `/admin/email`
   - Click "Test Email Configuration"
   - Enter your email and send a test email

### Step 3: Verify Everything Works

1. **Test Registration Flow**
   - Visit: `https://your-app.vercel.app/register`
   - Fill out a test registration
   - Verify it appears in admin panel

2. **Test Admin Panel**
   - Login at `/admin/login`
   - Check all sections:
     - Dashboard
     - Registrations
     - Inventory
     - Finance
     - Settings
     - Email

3. **Check Database**
   ```bash
   # Using your local environment with production DATABASE_URL
   export DATABASE_URL="your-production-database-url"
   ./scripts/db.sh verify
   ./scripts/db.sh count
   ```

---

## Troubleshooting

### Database Connection Issues

**Error: "DATABASE_URL environment variable is not set"**
- Ensure `DATABASE_URL` is set in Vercel environment variables
- Redeploy after adding environment variables
- Check that the connection string format is correct

**Error: "Connection refused" or "SSL required"**
- Add `?sslmode=require` to your connection string
- For Neon, SSL is required
- Check firewall settings if using self-hosted Postgres

### Build Errors on Vercel

**Error: "Module not found"**
- Ensure all dependencies are in `package.json`
- Run `npm install` locally to verify
- Check `package-lock.json` is committed

**Error: "TypeScript errors"**
- Fix TypeScript errors locally first
- Run `npm run build` locally to catch errors
- Check `tsconfig.json` configuration

### Email Not Sending

**Error: "SMTP settings not configured"**
- Configure SMTP in admin settings panel
- Verify SMTP credentials are correct
- For Gmail, use App Password, not regular password

**Error: "Authentication failed"**
- Check email and password are correct
- For Gmail, ensure "Less secure app access" is enabled OR use App Password
- Verify SMTP host and port are correct

### Admin Login Issues

**Can't login to admin panel**
- Verify admin user exists: `./scripts/db.sh list-admins`
- Create admin user: `./scripts/db.sh create-admin username password`
- Check that `ADMIN_PASSWORD` matches if using default seeding

---

## Security Checklist

Before going live:

- [ ] Change default admin password
- [ ] Use strong, unique passwords
- [ ] Enable HTTPS (automatic on Vercel)
- [ ] Set `NODE_ENV=production` in Vercel
- [ ] Review and restrict admin user roles
- [ ] Configure CORS if needed
- [ ] Set up database backups (Neon has automatic backups)
- [ ] Review environment variables (don't commit secrets)
- [ ] Test email functionality
- [ ] Verify database connection uses SSL

---

## Additional Resources

- **Neon Documentation**: [neon.tech/docs](https://neon.tech/docs)
- **Vercel Documentation**: [vercel.com/docs](https://vercel.com/docs)
- **Next.js Documentation**: [nextjs.org/docs](https://nextjs.org/docs)
- **PostgreSQL Documentation**: [postgresql.org/docs](https://www.postgresql.org/docs/)

---

## Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review error logs in Vercel dashboard
3. Check database connection and schema
4. Verify all environment variables are set correctly
