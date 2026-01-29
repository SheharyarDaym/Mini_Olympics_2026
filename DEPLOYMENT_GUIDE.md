# Complete Deployment Guide

## 📋 Pre-Deployment Checklist

### ✅ What We've Completed
- [x] Node.js and dependencies installed
- [x] Database configured (Neon)
- [x] Database initialized with all tables
- [x] Admin user created
- [x] Application running locally
- [x] All API endpoints working

### 🔍 What to Check on Neon Website

#### 1. **Verify Your Database Connection**
- Go to your Neon dashboard: https://console.neon.tech
- Click on your project: `mini-olympics-oc`
- Check **Connection Details**:
  - ✅ Connection string is active
  - ✅ Database is accessible
  - ✅ SSL is enabled (required)

#### 2. **Check Database Status**
- In Neon dashboard, verify:
  - ✅ Project is **Active** (not paused)
  - ✅ Database size is within limits (free tier: 0.5 GB)
  - ✅ No errors or warnings

#### 3. **Get Production Connection String**
- In Neon dashboard → **Connection Details**
- Copy the connection string (you'll need this for Vercel)
- Format: `postgresql://user:password@ep-xxx.region.aws.neon.tech/neondb?sslmode=require`

#### 4. **Optional: Create a Separate Production Database**
- You can create a new branch in Neon for production
- Or use the same database (simpler for now)
- **Recommended**: Use the same database for simplicity

#### 5. **Backup Your Connection String**
- Save it securely (you'll need it for Vercel)
- The connection string contains your password - keep it safe!

---

## 🚀 Deploy to Vercel

### Step 1: Prepare Your Code

#### Option A: Using Git (Recommended)

1. **Initialize Git** (if not already):
   ```bash
   cd /home/moin/Desktop/Mini-olympics
   git init
   git add .
   git commit -m "Initial commit - Ready for deployment"
   ```

2. **Create GitHub Repository**:
   - Go to https://github.com/new
   - Create a new repository (e.g., `mini-olympics-oc`)
   - **Don't** initialize with README (we already have files)
   - Copy the repository URL

3. **Push to GitHub**:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/mini-olympics-oc.git
   git branch -M main
   git push -u origin main
   ```

#### Option B: Direct Upload (Without Git)

- You can upload the folder directly to Vercel
- But Git is recommended for version control

### Step 2: Deploy to Vercel

1. **Go to Vercel**:
   - Visit: https://vercel.com/new
   - Sign up/Login (can use GitHub account)

2. **Import Project**:
   - Click **"Import Project"**
   - If using Git: Select your GitHub repository
   - If not using Git: Click **"Upload"** and select your project folder

3. **Configure Project**:
   - **Project Name**: `mini-olympics-oc` ⚠️ **IMPORTANT**: Use this exact name to get `https://mini-olympics-oc.vercel.app/`
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `./` (default)
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `.next` (default)
   - **Install Command**: `npm install` (default)

4. **Set Environment Variables**:
   Before clicking "Deploy", click **"Environment Variables"** and add:
   
   ```
   DATABASE_URL = postgresql://neondb_owner:npg_jPhNGt3AfrJ8@ep-gentle-pine-ah5zymp1-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
   ADMIN_USERNAME = admin
   ADMIN_PASSWORD = admin@fcit2025
   ```
   
   **Important**: 
   - Set these for **Production**, **Preview**, and **Development** environments
   - Use a **stronger password** for production (change `admin@fcit2025` to something secure)

5. **Deploy**:
   - Click **"Deploy"**
   - Wait for build to complete (2-5 minutes)
   - Your app will be live at: `https://mini-olympics-oc.vercel.app`

### Step 3: Post-Deployment Setup

#### 3.1 Verify Database is Accessible from Vercel

The database should already be initialized, but verify:

1. **Check if tables exist** (optional):
   - Go to Neon dashboard → SQL Editor
   - Run: `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';`
   - Should show all tables (registrations, admin_users, etc.)

#### 3.2 Verify Admin User Exists

Your admin user should already exist, but you can verify:

1. **Check via Neon SQL Editor**:
   ```sql
   SELECT username, role FROM admin_users;
   ```
   Should show: `admin` with role `super_admin`

2. **Or create a new admin** (if needed):
   - Use the create-admin script locally with production DATABASE_URL
   - Or use Neon SQL Editor

#### 3.3 Test Your Deployed App

1. **Visit**: `https://mini-olympics-oc.vercel.app`
2. **Test Registration**: `https://mini-olympics-oc.vercel.app/register`
3. **Test Admin Login**: `https://mini-olympics-oc.vercel.app/admin/login`
   - Username: `admin`
   - Password: `admin@fcit2025` (or your production password)

#### 3.4 Configure SMTP (Optional but Recommended)

1. Login to admin panel
2. Go to **Settings** → **SMTP Configuration**
3. Enter your email settings:
   - SMTP Host: `smtp.gmail.com` (or your provider)
   - SMTP Port: `587`
   - SMTP Email: Your email
   - SMTP Password: Your app password
   - From Name: `FCIT Sports Society`

---

## 🔐 Security Checklist Before Going Live

- [ ] Change default admin password in Vercel environment variables
- [ ] Use a strong, unique password for production
- [ ] Verify HTTPS is enabled (automatic on Vercel)
- [ ] Test all admin functions
- [ ] Test registration flow
- [ ] Configure SMTP for email notifications
- [ ] Review admin user roles
- [ ] Set up database backups (Neon has automatic backups)

---

## 📝 Important Notes

### Neon Database
- **Free Tier**: 0.5 GB storage, scales to zero when inactive
- **Automatic Backups**: Included in free tier
- **Connection String**: Keep it secure, don't commit to Git
- **SSL Required**: Always use `?sslmode=require` in connection string

### Vercel Deployment
- **Project Name**: Must be `mini-olympics-oc` to get the correct URL
- **Environment Variables**: Set in Vercel dashboard, not in code
- **Automatic Deployments**: Every push to main branch auto-deploys
- **Custom Domain**: Can add later in Vercel settings

### Database Connection
- **Same Database**: Using same DB for dev and production is fine for now
- **Separate DBs**: Can create separate Neon projects later if needed
- **Connection Pooling**: Neon handles this automatically

---

## 🛠️ Troubleshooting

### Build Fails on Vercel
- Check build logs in Vercel dashboard
- Ensure all dependencies are in `package.json`
- Verify environment variables are set correctly

### Database Connection Errors
- Verify `DATABASE_URL` is correct in Vercel
- Check Neon dashboard - ensure project is active
- Verify SSL is enabled (`?sslmode=require`)

### 500 Errors After Deployment
- Check Vercel function logs
- Verify database tables exist (run init script if needed)
- Check environment variables are set

### Admin Login Not Working
- Verify admin user exists in database
- Check `ADMIN_USERNAME` and `ADMIN_PASSWORD` in Vercel
- Verify role is set to `super_admin`

---

## 📚 Next Steps After Deployment

1. **Test Everything**:
   - Registration form
   - Admin login
   - All admin panels
   - Email functionality

2. **Monitor**:
   - Check Vercel analytics
   - Monitor Neon database usage
   - Review error logs

3. **Optimize**:
   - Add custom domain (optional)
   - Set up monitoring
   - Configure backups

4. **Maintain**:
   - Regular updates
   - Security patches
   - Database maintenance

---

## 🎉 You're Ready to Deploy!

Your application is fully set up and ready for production deployment. Follow the steps above to deploy to Vercel and make your Mini Olympics registration system live!
