# Database Setup Instructions

## Quick Setup Options

### Option 1: Neon (Recommended - Free & Easy)

1. **Sign up for Neon** (free tier available):
   - Go to: https://neon.tech
   - Click "Sign Up" (can use GitHub account)
   - Create a new project

2. **Get your connection string**:
   - In Neon dashboard, go to your project
   - Click "Connection Details" or "Connection String"
   - Copy the connection string
   - Format: `postgresql://user:password@ep-xxx.region.aws.neon.tech/dbname?sslmode=require`

3. **Add to env.local**:
   ```bash
   DATABASE_URL=your-neon-connection-string-here
   ADMIN_USERNAME=admin
   ADMIN_PASSWORD=your-secure-password-here
   ```

### Option 2: Local PostgreSQL

If you have PostgreSQL installed locally:

1. **Create database**:
   ```bash
   createdb miniolympics
   ```

2. **Connection string**:
   ```bash
   DATABASE_URL=postgresql://your-username:your-password@localhost:5432/miniolympics?sslmode=require
   ```

### Option 3: Other PostgreSQL Providers

- **Supabase**: https://supabase.com
- **Railway**: https://railway.app
- **AWS RDS**: https://aws.amazon.com/rds
- **DigitalOcean**: https://www.digitalocean.com/products/managed-databases

All use the same connection string format:
```
postgresql://username:password@host:port/database?sslmode=require
```

## After Setting Up Database

Once you have your `DATABASE_URL` in `env.local`, run:

```bash
# Make script executable
chmod +x scripts/db.sh

# Initialize database
./scripts/db.sh init

# Create admin user
./scripts/db.sh create-admin admin your-password
```
