# Quick Start Checklist

Use this checklist to quickly set up and deploy the Mini Olympics system.

## ✅ Pre-Deployment Checklist

### 1. Install Required Software
- [ ] Node.js (v18+) installed: `node --version`
- [ ] npm installed: `npm --version`
- [ ] PostgreSQL client tools installed (for database scripts)
- [ ] Git installed (for version control)

### 2. Install Project Dependencies
```bash
npm install
```

### 3. Set Up Database
- [ ] Create Neon account at [neon.tech](https://neon.tech) OR set up PostgreSQL database
- [ ] Get your database connection string
- [ ] Copy `env.example` to `env.local`
- [ ] Add `DATABASE_URL` to `env.local`
- [ ] Add `ADMIN_USERNAME` and `ADMIN_PASSWORD` to `env.local`

### 4. Initialize Database
```bash
# Make script executable
chmod +x scripts/db.sh

# Initialize database
./scripts/db.sh init

# Create admin user
./scripts/db.sh create-admin admin your-password
```

### 5. Test Locally
```bash
npm run dev
```
- [ ] Visit `http://localhost:3000`
- [ ] Test registration form
- [ ] Test admin login at `/admin/login`

## ✅ Vercel Deployment Checklist

### 1. Prepare for Deployment
- [ ] Push code to GitHub/GitLab/Bitbucket (recommended)
- [ ] Or prepare to use Vercel CLI

### 2. Deploy to Vercel
- [ ] Go to [vercel.com/new](https://vercel.com/new)
- [ ] Import your repository
- [ ] Set environment variables:
  - [ ] `DATABASE_URL` (your production database connection string)
  - [ ] `ADMIN_USERNAME` (e.g., `admin`)
  - [ ] `ADMIN_PASSWORD` (strong password)
- [ ] Deploy

### 3. Post-Deployment
- [ ] Initialize production database:
  ```bash
  export DATABASE_URL="your-production-database-url"
  ./scripts/db.sh init
  ./scripts/db.sh create-admin admin your-production-password
  ```
- [ ] Visit your deployed app: `https://your-app.vercel.app`
- [ ] Login to admin panel: `/admin/login`
- [ ] Configure SMTP settings in `/admin/settings`
- [ ] Test email functionality in `/admin/email`

### 4. Verify Everything Works
- [ ] Public registration form works
- [ ] Admin login works
- [ ] Can view registrations
- [ ] Can update registration status
- [ ] Email sending works (test email)
- [ ] Database queries work

## 🔧 Common Issues

**Database connection fails:**
- Check `DATABASE_URL` format
- Ensure SSL is enabled (`?sslmode=require`)
- Verify database is accessible

**Build fails on Vercel:**
- Check all dependencies are in `package.json`
- Run `npm run build` locally first
- Check TypeScript errors

**Admin login doesn't work:**
- Verify admin user exists: `./scripts/db.sh list-admins`
- Create admin user if missing: `./scripts/db.sh create-admin username password`

**Email not sending:**
- Configure SMTP in admin settings
- For Gmail, use App Password (not regular password)
- Test email configuration first

## 📚 Full Documentation

See `SETUP_AND_DEPLOYMENT.md` for detailed instructions.
