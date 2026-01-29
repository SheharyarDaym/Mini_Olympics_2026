#!/bin/bash
# Complete database setup script - Step by Step

set -e

echo "🚀 Mini Olympics Database Setup"
echo "================================"
echo ""

# Load nvm
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Step 1: Check env.local
echo "Step 1: Checking environment configuration..."
ENV_FILE="env.local"

if [ ! -f "$ENV_FILE" ]; then
    echo "   Creating $ENV_FILE from template..."
    cp env.example "$ENV_FILE"
fi

# Check if DATABASE_URL is set
if ! grep -q "^DATABASE_URL=.*[^[:space:]]" "$ENV_FILE" 2>/dev/null; then
    echo ""
    echo "❌ DATABASE_URL is not set in $ENV_FILE"
    echo ""
    echo "📝 Please set up your database:"
    echo ""
    echo "   Option 1: Neon (Recommended - Free)"
    echo "   1. Go to: https://neon.tech"
    echo "   2. Sign up (can use GitHub)"
    echo "   3. Create a new project"
    echo "   4. Copy your connection string"
    echo ""
    echo "   Option 2: Other PostgreSQL"
    echo "   Use any PostgreSQL database connection string"
    echo ""
    echo "   Then edit $ENV_FILE and add:"
    echo "   DATABASE_URL=your-connection-string-here"
    echo "   ADMIN_PASSWORD=your-secure-password"
    echo ""
    echo "   Or run: ./configure-db.sh"
    echo ""
    exit 1
fi

# Load environment variables
set -a
source "$ENV_FILE" 2>/dev/null || true
set +a

if [ -z "$DATABASE_URL" ]; then
    echo "❌ DATABASE_URL is empty in $ENV_FILE"
    exit 1
fi

echo "   ✅ DATABASE_URL is set"
echo ""

# Step 2: Initialize database
echo "Step 2: Initializing database schema..."
echo "   Running: node scripts/init-db-node.js"
echo ""

if node scripts/init-db-node.js; then
    echo ""
    echo "   ✅ Database initialized successfully!"
else
    echo ""
    echo "   ❌ Database initialization failed"
    exit 1
fi

echo ""

# Step 3: Create admin user
echo "Step 3: Creating admin user..."
ADMIN_USER="${ADMIN_USERNAME:-admin}"
ADMIN_PASS="${ADMIN_PASSWORD:-admin@fcit2025}"

if [ -z "$ADMIN_PASSWORD" ]; then
    echo "   ⚠️  ADMIN_PASSWORD not set, using default: admin@fcit2025"
    echo "   (You can change this later in $ENV_FILE)"
fi

echo "   Running: node scripts/create-admin-node.js $ADMIN_USER [password]"
echo ""

if node scripts/create-admin-node.js "$ADMIN_USER" "$ADMIN_PASS"; then
    echo ""
    echo "   ✅ Admin user created successfully!"
else
    echo ""
    echo "   ❌ Failed to create admin user"
    exit 1
fi

echo ""
echo "✅ Database setup complete!"
echo ""
echo "📋 Summary:"
echo "   Database: ✅ Initialized"
echo "   Admin User: ✅ Created ($ADMIN_USER)"
echo ""
echo "🚀 Next step: Start the development server"
echo "   Run: npm run dev"
echo ""
echo "   Then visit: http://localhost:3000"
echo "   Admin login: http://localhost:3000/admin/login"
echo ""
