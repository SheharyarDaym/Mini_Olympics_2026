# Mini Olympics Registration System

A comprehensive registration and management system for FCIT Sports Society Mini Olympics 2026, built with Next.js 14, TypeScript, and PostgreSQL (Neon).

## 🎯 Features

### Public Features
- **Registration Form** - Multi-step registration with game selection
- **Payment Methods** - Support for cash and online payments; optional coupon codes for percentage discount
- **Team Management** - Team name validation and member management
- **QR Code Generation** - Registration confirmation with QR codes
- **Email Notifications** - Automated email confirmations

### Admin Features
- **Dashboard** - Overview with statistics and quick access
- **Registration Management** - View, verify, and manage registrations
- **Payment Verification** - Approve cash and online payments
- **Finance Tracking** - Income, expense, and balance management
- **Inventory Management** - Equipment tracking and loan management
- **Email System** - Bulk and individual email sending with templates
- **Match Scheduling** - HOC (Head of Competition) match management
- **Settings** - Game pricing, SMTP configuration, and system settings
- **Role-Based Access** - Super admin, registration admin, inventory admin, HOC admin

## 🚀 Quick Start

### Prerequisites

- **Node.js** v18 or higher ([Download](https://nodejs.org/))
- **npm** (comes with Node.js)
- **PostgreSQL Database** (Neon recommended - [Sign up](https://neon.tech))
- **Git** (for deployment - [Download](https://git-scm.com/))

### Installation

1. **Clone or download the project**
   ```bash
   cd Mini-olympics
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example env.local
   ```
   
   Edit `env.local` and add:
   ```bash
   DATABASE_URL=postgresql://user:password@host/database?sslmode=require
   ADMIN_USERNAME=admin
   ADMIN_PASSWORD=your-secure-password
   ```

4. **Initialize database**
   ```bash
   # Using Node.js script (no psql required)
   node scripts/init-db-node.js
   
   # Create admin user
   node scripts/create-admin-node.js admin your-password
   ```

   **Enable coupons (optional):** If you use an existing database, run the coupons migration once (e.g. via Neon SQL Editor or psql):
   ```sql
   -- Run scripts/add-coupons-and-column.sql
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

6. **Access the application**
   - Main app: http://localhost:3000
   - Registration: http://localhost:3000/register
   - Admin login: http://localhost:3000/admin/login

## 🗄️ Database Setup

### Option 1: Neon (Recommended)

1. **Create Neon account**: https://neon.tech
2. **Create new project**: 
   - Project name: `mini-olympics-oc`
   - Postgres version: `17`
   - Region: `AWS US East 1 (N. Virginia)` or closest to you
   - **Disable** Neon Auth (we use our own authentication)
3. **Get connection string** from dashboard
4. **Add to `env.local`**:
   ```bash
   DATABASE_URL=your-neon-connection-string
   ```

### Option 2: Standard PostgreSQL

Use any PostgreSQL database with connection string:
```
postgresql://username:password@host:port/database?sslmode=require
```

### Database Initialization

After setting `DATABASE_URL` in `env.local`:

```bash
# Initialize all tables and seed data
node scripts/init-db-node.js

# Create admin user
node scripts/create-admin-node.js admin your-password
```

**Alternative**: If you have `psql` installed:
```bash
./scripts/db.sh init
./scripts/db.sh create-admin admin your-password
```

## 📦 Project Structure

```
Mini-olympics/
├── app/                    # Next.js App Router
│   ├── admin/             # Admin panel pages
│   ├── api/               # API routes
│   ├── register/          # Public registration
│   └── layout.tsx         # Root layout
├── components/             # React components
│   ├── admin/            # Admin components
│   └── ui/               # UI components (shadcn/ui)
├── lib/                   # Utilities
│   ├── db.ts             # Database connection
│   ├── auth.ts           # Authentication
│   └── schema.ts         # Database schema
├── scripts/               # Database scripts
│   ├── init-db-node.js   # Node.js initialization
│   ├── create-admin-node.js  # Create admin user
│   └── db.sh             # Bash database script
├── package.json           # Dependencies
└── env.example            # Environment template
```

## 🔧 Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm start            # Start production server
npm run lint         # Run ESLint

# Database (Node.js - no psql required)
node scripts/init-db-node.js              # Initialize database
node scripts/create-admin-node.js <user> <pass>  # Create admin user

# Database (Bash - requires psql)
./scripts/db.sh init                      # Initialize database
./scripts/db.sh migrate                   # Run migrations
./scripts/db.sh verify                    # Verify schema
./scripts/db.sh create-admin <user> <pass>  # Create admin user
./scripts/db.sh list-admins               # List admin users
```

## 🌐 Deployment to Vercel

### Step 1: Prepare Code

```bash
# Initialize Git
git init
git add .
git commit -m "Initial commit"

# Create GitHub repository and push
git remote add origin https://github.com/YOUR_USERNAME/mini-olympics-oc.git
git branch -M main
git push -u origin main
```

### Step 2: Deploy to Vercel

1. **Go to**: https://vercel.com/new
2. **Import** your GitHub repository
3. **Set Project Name**: `mini-olympics-oc` ⚠️ **IMPORTANT** - This gives you `https://mini-olympics-oc.vercel.app/`
4. **Add Environment Variables**:
   - `DATABASE_URL` - Your Neon connection string
   - `ADMIN_USERNAME` - `admin` (or your username)
   - `ADMIN_PASSWORD` - Your secure password
5. **Deploy** - Wait 2-5 minutes

### Step 3: Post-Deployment

1. **Verify deployment**: Visit `https://mini-olympics-oc.vercel.app`
2. **Test admin login**: `/admin/login`
3. **Change password**: Update `ADMIN_PASSWORD` in Vercel to a secure value
4. **Configure SMTP**: In admin settings (optional)

## 🔍 What to Check on Neon

After deployment, verify in Neon dashboard (https://console.neon.tech):

- ✅ Project status is **Active**
- ✅ Connection string is accessible
- ✅ Database tables exist (check SQL Editor)
- ✅ No errors or warnings
- ✅ Storage usage is within limits (free tier: 0.5 GB)

## 🔐 Environment Variables

### Required

```bash
DATABASE_URL=postgresql://user:password@host/database?sslmode=require
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your-secure-password
```

### Optional

```bash
NODE_ENV=production  # Automatically set by Vercel
```

**Note**: SMTP settings are configured via admin panel, not environment variables.

## 📊 Database Tables

- `registrations` - Participant registrations
- `admin_users` - Admin authentication
- `admin_sessions` - Session management
- `games_pricing` - Game pricing by gender
- `sport_groups` - Sport group mappings
- `esports_settings` - Esports configuration
- `system_settings` - System-wide settings (SMTP, etc.)
- `inventory_items` - Equipment inventory
- `inventory_movements` - Inventory tracking
- `inventory_loans` - Equipment loans
- `finance_records` - Financial transactions
- `finance_attachments` - Financial documents
- `match_schedules` - Match scheduling

## 🛠️ Technology Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL (via Neon serverless)
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI, shadcn/ui
- **Forms**: React Hook Form + Zod
- **Email**: Nodemailer
- **Icons**: Lucide React

## 🔒 Security

- ✅ HTTPS enabled (automatic on Vercel)
- ✅ Environment variables for secrets
- ✅ SQL injection protection (parameterized queries)
- ✅ Role-based access control
- ✅ Session-based authentication
- ✅ Password hashing (scrypt)

## 📝 Admin Roles

- **super_admin** - Full access to all features
- **registration_admin** - Registration management only
- **inventory_admin** - Inventory management only
- **hoc_admin** - HOC/match scheduling only

## 🐛 Troubleshooting

### Database Connection Issues
- Verify `DATABASE_URL` is correct
- Ensure SSL is enabled (`?sslmode=require`)
- Check Neon dashboard - project should be active

### Build Errors
- Run `npm install` to ensure all dependencies are installed
- Check TypeScript errors: `npm run build`
- Verify Node.js version (v18+)

### Admin Login Issues
- Verify admin user exists: Check database or create with script
- Check `ADMIN_USERNAME` and `ADMIN_PASSWORD` in environment
- Ensure role is set to `super_admin`

### 500 Errors on Dashboard
- Verify all database tables exist (run init script)
- Check Vercel function logs for errors
- Ensure environment variables are set correctly

## 📚 Additional Resources

- **Neon Documentation**: https://neon.tech/docs
- **Vercel Documentation**: https://vercel.com/docs
- **Next.js Documentation**: https://nextjs.org/docs

## 📄 License

Private project for FCIT Sports Society.

## 👥 Support

For issues or questions, check:
1. Vercel deployment logs
2. Neon database status
3. Browser console for errors
4. Server logs in terminal

---

**Built for FCIT Sports Society - Mini Olympics 2026** 🏆
