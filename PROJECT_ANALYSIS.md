# Project Analysis & Requirements

## 📦 What's Already Installed (Dependencies)

All required dependencies are listed in `package.json` and should be installed with `npm install`:

### Core Framework
- ✅ Next.js 14.0.4
- ✅ React 18.2.0
- ✅ TypeScript 5.3.3

### Database
- ✅ @neondatabase/serverless 0.7.0 (for Neon/Postgres serverless connections)
- ✅ drizzle-orm 0.29.0 (schema definitions, though queries use raw SQL)

### UI Components
- ✅ Tailwind CSS 3.4.0
- ✅ Radix UI components (dialog, label, select, slot, toast)
- ✅ Lucide React (icons)
- ✅ class-variance-authority, clsx, tailwind-merge (styling utilities)

### Forms & Validation
- ✅ react-hook-form 7.49.2
- ✅ @hookform/resolvers 3.3.4
- ✅ zod 3.22.4 (schema validation)

### Utilities
- ✅ nodemailer 7.0.12 (email sending)
- ✅ date-fns 3.0.6 (date formatting)
- ✅ uuid 9.0.1 (ID generation)
- ✅ jspdf 4.0.0 (PDF generation)
- ✅ qrcode 1.5.3 (QR code generation)

### Development Tools
- ✅ ESLint with Next.js config
- ✅ PostCSS & Autoprefixer
- ✅ TypeScript types for all dependencies

## ❌ What's Missing / Needs to be Installed

### System-Level Requirements

1. **Node.js** (v18 or higher)
   - Check: `node --version`
   - Install: [nodejs.org](https://nodejs.org/)

2. **npm** (comes with Node.js)
   - Check: `npm --version`

3. **PostgreSQL Client Tools** (for database scripts)
   - **Linux**: `sudo apt-get install postgresql-client`
   - **macOS**: `brew install postgresql` or `brew install libpq`
   - **Windows**: Install PostgreSQL (includes psql)

4. **Git** (for version control and deployment)
   - Check: `git --version`
   - Install: [git-scm.com](https://git-scm.com/)

### Optional but Recommended

5. **Vercel CLI** (for easier deployment)
   - Install: `npm install -g vercel`

## 🗄️ Database Requirements

### Database Options

1. **Neon (Recommended for Serverless)**
   - Free tier available
   - Serverless Postgres
   - Automatic backups
   - Perfect for Vercel deployment
   - Sign up: [neon.tech](https://neon.tech)

2. **Standard PostgreSQL**
   - Self-hosted or cloud (AWS RDS, DigitalOcean, etc.)
   - Requires SSL for production
   - Connection string format: `postgresql://user:password@host:port/database?sslmode=require`

### Database Schema

The project includes comprehensive database scripts:
- `scripts/db.sh` - Main database management script
- `scripts/init-db.sql` - Initial schema creation
- `scripts/migrate-db.sql` - Migration scripts

**Tables created:**
- `registrations` - Main registration data
- `admin_users` - Admin authentication
- `admin_sessions` - Session management
- `games_pricing` - Game pricing configuration
- `sport_groups` - Sport group mappings
- `esports_settings` - Esports configuration
- `system_settings` - System-wide settings (SMTP, etc.)
- `inventory_items` - Inventory management
- `inventory_movements` - Inventory tracking
- `inventory_loans` - Equipment loans
- `finance_records` - Financial records
- `finance_attachments` - Financial document attachments
- `match_schedules` - Match scheduling

## 🔐 Environment Variables Required

### Required for Local Development

Create `env.local` file with:

```bash
# Database connection (REQUIRED)
DATABASE_URL=postgresql://user:password@host/database?sslmode=require

# Admin credentials (REQUIRED for production)
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your-secure-password
```

### Required for Vercel Deployment

Set these in Vercel Dashboard → Settings → Environment Variables:

1. **DATABASE_URL** - Your production database connection string
2. **ADMIN_USERNAME** - Admin username (default: `admin`)
3. **ADMIN_PASSWORD** - Strong admin password

### Optional Environment Variables

- `NODE_ENV` - Automatically set by Vercel to `production`
- `NEXT_PUBLIC_APP_URL` - Your app URL (if needed for absolute URLs)

### SMTP Settings (Configured via Admin Panel)

SMTP settings are stored in the database, not environment variables. Configure via `/admin/settings`:

- `smtp_host` - SMTP server (e.g., `smtp.gmail.com`)
- `smtp_port` - Port (587 for TLS, 465 for SSL)
- `smtp_email` - Your email address
- `smtp_password` - Email password or app password
- `smtp_from_name` - Display name

## 🚀 Vercel Deployment Requirements

### Prerequisites

1. **Vercel Account**
   - Sign up: [vercel.com](https://vercel.com)
   - Free tier is sufficient

2. **Git Repository** (recommended)
   - GitHub, GitLab, or Bitbucket
   - Or use Vercel CLI for direct deployment

### Vercel Configuration

The project includes `vercel.json` with optimal settings:
- Framework: Next.js (auto-detected)
- Build command: `npm run build`
- Install command: `npm install`
- Region: `iad1` (US East)

### Deployment Steps

1. **Import Project to Vercel**
   - Connect Git repository OR upload folder
   - Vercel auto-detects Next.js

2. **Set Environment Variables**
   - Go to Project Settings → Environment Variables
   - Add: `DATABASE_URL`, `ADMIN_USERNAME`, `ADMIN_PASSWORD`
   - Set for: Production, Preview, Development

3. **Deploy**
   - Click "Deploy"
   - Wait for build to complete
   - App will be live at `https://your-project.vercel.app`

4. **Post-Deployment**
   - Initialize database schema
   - Create admin user
   - Configure SMTP settings

## 📋 Project Structure

```
Mini-olympics/
├── app/                    # Next.js App Router
│   ├── admin/             # Admin panel pages
│   ├── api/               # API routes
│   ├── register/          # Public registration
│   └── layout.tsx         # Root layout
├── components/            # React components
│   ├── admin/            # Admin components
│   └── ui/               # UI components
├── lib/                   # Utilities
│   ├── db.ts             # Database connection (Neon)
│   ├── db-simple.ts      # Simple DB helper
│   ├── schema.ts         # Drizzle schema (definitions)
│   ├── auth.ts           # Authentication logic
│   └── utils.ts          # Utility functions
├── scripts/               # Database scripts
│   ├── db.sh             # Main DB management script
│   ├── init-db.sql       # Initial schema
│   └── migrate-db.sql    # Migrations
├── package.json           # Dependencies
├── next.config.js         # Next.js config
├── tsconfig.json          # TypeScript config
├── tailwind.config.ts     # Tailwind config
├── vercel.json            # Vercel deployment config
└── env.example            # Environment template
```

## ✅ Installation Checklist

### Local Setup
- [ ] Install Node.js (v18+)
- [ ] Install PostgreSQL client tools
- [ ] Run `npm install`
- [ ] Create `env.local` from `env.example`
- [ ] Set `DATABASE_URL` in `env.local`
- [ ] Set `ADMIN_USERNAME` and `ADMIN_PASSWORD` in `env.local`
- [ ] Run `./scripts/db.sh init` to initialize database
- [ ] Run `./scripts/db.sh create-admin admin your-password`
- [ ] Run `npm run dev` to start development server

### Vercel Deployment
- [ ] Create Vercel account
- [ ] Push code to Git repository (recommended)
- [ ] Import project to Vercel
- [ ] Set environment variables in Vercel dashboard
- [ ] Deploy project
- [ ] Initialize production database
- [ ] Create admin user in production
- [ ] Configure SMTP settings via admin panel
- [ ] Test all functionality

## 🔍 Key Features

### Public Features
- Registration form with game selection
- Payment method selection (cash/online)
- Registration confirmation
- QR code generation

### Admin Features
- Dashboard with statistics
- Registration management
- Payment verification
- Email sending (bulk and individual)
- Inventory management
- Finance tracking
- Match scheduling (HOC)
- Settings management
- Role-based access control

### Technical Features
- Serverless database (Neon compatible)
- Session-based authentication
- Email notifications
- PDF generation
- QR code generation
- CSV export
- Responsive design

## 🛠️ Development Commands

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint

# Database operations
./scripts/db.sh init          # Initialize database
./scripts/db.sh migrate       # Run migrations
./scripts/db.sh verify        # Verify schema
./scripts/db.sh count         # Show counts
./scripts/db.sh test          # Test connection
./scripts/db.sh create-admin  # Create admin user
./scripts/db.sh list-admins   # List admins
```

## 📝 Notes

1. **Database**: The project uses raw SQL queries with Neon's serverless driver. Drizzle ORM is installed but primarily used for schema definitions.

2. **Environment Files**: The project supports both `env.local` and `.env.local`. The scripts check for both.

3. **Build Scripts**: The npm scripts automatically load environment variables from `env.local` or `.env.local`.

4. **Email**: SMTP settings are stored in the database (`system_settings` table), not in environment variables. Configure via admin panel.

5. **Admin Roles**: The system supports role-based access:
   - `super_admin` - Full access
   - `registration_admin` - Registration management only
   - `inventory_admin` - Inventory management only
   - `hoc_admin` - HOC/match scheduling only

## 🚨 Important Security Notes

- Never commit `env.local` or `.env.local` to Git (already in `.gitignore`)
- Use strong passwords for admin accounts
- Enable SSL for database connections (`?sslmode=require`)
- Use App Passwords for Gmail SMTP (not regular passwords)
- Review admin user roles and permissions
- Set up database backups (Neon has automatic backups)

## 📚 Documentation Files

- `SETUP_AND_DEPLOYMENT.md` - Comprehensive setup and deployment guide
- `QUICK_START.md` - Quick checklist for setup
- `README.md` - Basic project documentation
- `PROJECT_ANALYSIS.md` - This file (project analysis)
