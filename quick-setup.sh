#!/bin/bash
# Quick interactive setup

echo "🚀 Quick Database Setup"
echo "======================="
echo ""

# Load nvm
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

read -p "Enter your Neon/PostgreSQL connection string: " DB_URL

if [ -z "$DB_URL" ]; then
    echo "❌ Connection string cannot be empty"
    exit 1
fi

read -sp "Enter admin password (default: admin@fcit2025): " ADMIN_PASS
echo ""
ADMIN_PASS=${ADMIN_PASS:-admin@fcit2025}

# Update env.local
cat > env.local << EOF
# Environment variables
DATABASE_URL=$DB_URL
ADMIN_USERNAME=admin
ADMIN_PASSWORD=$ADMIN_PASS
EOF

echo ""
echo "✅ Configuration saved!"
echo ""
echo "📦 Initializing database..."
node scripts/init-db-node.js

echo ""
echo "👤 Creating admin user..."
node scripts/create-admin-node.js admin "$ADMIN_PASS"

echo ""
echo "✅ Setup complete!"
echo ""
echo "🚀 Start the server with: npm run dev"
