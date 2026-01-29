#!/bin/bash
# Interactive database configuration script

set -e

echo "🔧 Database Configuration Helper"
echo "=================================="
echo ""

# Check if env.local exists
ENV_FILE="env.local"
if [ ! -f "$ENV_FILE" ]; then
    echo "❌ $ENV_FILE not found. Creating from template..."
    cp env.example "$ENV_FILE"
fi

# Check if DATABASE_URL is already set
if grep -q "^DATABASE_URL=.*[^[:space:]]" "$ENV_FILE" 2>/dev/null; then
    echo "ℹ️  DATABASE_URL is already set in $ENV_FILE"
    read -p "Do you want to update it? (y/n): " update
    if [ "$update" != "y" ] && [ "$update" != "Y" ]; then
        echo "Keeping existing DATABASE_URL"
        exit 0
    fi
fi

echo "📝 Please provide your database connection details:"
echo ""
echo "Option 1: Neon Database (Recommended)"
echo "  1. Go to https://neon.tech and sign up"
echo "  2. Create a new project"
echo "  3. Copy your connection string"
echo ""
echo "Option 2: Other PostgreSQL Database"
echo "  Format: postgresql://user:password@host:port/database?sslmode=require"
echo ""

read -p "Enter your DATABASE_URL: " db_url

if [ -z "$db_url" ]; then
    echo "❌ DATABASE_URL cannot be empty"
    exit 1
fi

# Update env.local
if grep -q "^DATABASE_URL=" "$ENV_FILE"; then
    # Replace existing DATABASE_URL
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        sed -i '' "s|^DATABASE_URL=.*|DATABASE_URL=$db_url|" "$ENV_FILE"
    else
        # Linux
        sed -i "s|^DATABASE_URL=.*|DATABASE_URL=$db_url|" "$ENV_FILE"
    fi
else
    # Append DATABASE_URL
    echo "DATABASE_URL=$db_url" >> "$ENV_FILE"
fi

echo ""
read -p "Enter admin password (or press Enter to use default 'admin@fcit2025'): " admin_pass
admin_pass=${admin_pass:-admin@fcit2025}

if grep -q "^ADMIN_PASSWORD=" "$ENV_FILE"; then
    if [[ "$OSTYPE" == "darwin"* ]]; then
        sed -i '' "s|^ADMIN_PASSWORD=.*|ADMIN_PASSWORD=$admin_pass|" "$ENV_FILE"
    else
        sed -i "s|^ADMIN_PASSWORD=.*|ADMIN_PASSWORD=$admin_pass|" "$ENV_FILE"
    fi
else
    echo "ADMIN_PASSWORD=$admin_pass" >> "$ENV_FILE"
fi

echo ""
echo "✅ Configuration saved to $ENV_FILE"
echo ""
echo "📋 Next steps:"
echo "   1. Initialize database: node scripts/init-db-node.js"
echo "   2. Create admin user: node scripts/create-admin-node.js admin $admin_pass"
echo "   3. Start dev server: npm run dev"
