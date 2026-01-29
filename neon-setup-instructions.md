# Neon Database Setup - Recommended Settings

## ✅ Recommended Configuration

1. **Project name**: `mini-olympics-oc` ✅ (already filled - perfect!)

2. **Postgres version**: `17` ✅ (latest version - keep this)

3. **Cloud service provider**: `AWS` ✅ (keep this)

4. **Region**: 
   - `AWS US East 1 (N. Virginia)` ✅ (good for Vercel deployment)
   - Or choose the region closest to you if you're not in the US

5. **Enable Neon Auth**: **Turn OFF** ⚠️
   - We use our own admin authentication system
   - Neon Auth is not needed for this project

## 🚀 After Creating Project

1. Click **"Create project"** button
2. Wait for the project to be created (takes a few seconds)
3. You'll see a connection string like:
   ```
   postgresql://username:password@ep-xxx-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require
   ```
4. **Copy the connection string** - you'll need it in the next step!

## 📋 Next Steps

Once you have the connection string, I'll help you:
1. Add it to `env.local`
2. Initialize the database
3. Create admin user
4. Start the application
