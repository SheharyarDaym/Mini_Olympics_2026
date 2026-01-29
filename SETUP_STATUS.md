# Setup Status

## ✅ Completed Steps

1. **Node.js & npm installed** (v20.20.0 via nvm)
2. **Project dependencies installed** (`npm install` completed)
3. **Environment file created** (`env.local` created from `env.example`)
4. **Database initialization scripts created** (Node.js versions that don't require psql)

## 📋 Next Steps Required

### 1. Set Up Database Connection

You need to add your database connection string to `env.local`:

**Option A: Neon (Recommended)**
1. Go to https://neon.tech and sign up (free)
2. Create a new project
3. Copy your connection string
4. Add it to `env.local`:
   ```bash
   DATABASE_URL=postgresql://user:password@ep-xxx.region.aws.neon.tech/dbname?sslmode=require
   ADMIN_USERNAME=admin
   ADMIN_PASSWORD=your-secure-password
   ```

**Option B: Other PostgreSQL**
- Use any PostgreSQL database
- Connection string format: `postgresql://user:password@host:port/database?sslmode=require`

### 2. Initialize Database

Once `DATABASE_URL` is set in `env.local`, run:

```bash
cd /home/moin/Desktop/Mini-olympics
export NVM_DIR="$HOME/.nvm" && [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
node scripts/init-db-node.js
```

### 3. Create Admin User

```bash
node scripts/create-admin-node.js admin your-password
```

### 4. Start Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

## 🚀 Vercel Deployment

After testing locally:

1. **Push to Git** (if not already):
   ```bash
   git init  # if not already a git repo
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-repo-url>
   git push -u origin main
   ```

2. **Deploy to Vercel**:
   - Go to https://vercel.com/new
   - Import your repository
   - **Important**: Set project name to `mini-olympics-oc` (not `mini-olympics`)
   - Add environment variables:
     - `DATABASE_URL` (production database)
     - `ADMIN_USERNAME`
     - `ADMIN_PASSWORD`
   - Deploy

3. **Initialize Production Database**:
   - After deployment, run the init script with production DATABASE_URL
   - Or use Neon's SQL editor to run the SQL

4. **Configure SMTP** (via admin panel):
   - Login at `https://mini-olympics-oc.vercel.app/admin/login`
   - Go to Settings → SMTP Configuration
   - Enter your email settings

## 📝 Notes

- **nvm**: Node.js is installed via nvm. To use it in new terminals, run:
  ```bash
  export NVM_DIR="$HOME/.nvm"
  [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
  ```
  Or add this to your `~/.bashrc` for automatic loading.

- **PostgreSQL Client**: Not required! We created Node.js scripts that work without `psql`.

- **Project Name**: Make sure to set Vercel project name to `mini-olympics-oc` to get the URL `https://mini-olympics-oc.vercel.app/`
