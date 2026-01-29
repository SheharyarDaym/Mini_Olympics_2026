#!/bin/bash
# Installation script for Mini Olympics project requirements
# Run with: sudo bash install-requirements.sh

set -e

echo "🚀 Installing system requirements for Mini Olympics..."

# Update package list
echo "📦 Updating package list..."
apt update

# Install Node.js and npm (using NodeSource repository for latest LTS)
echo "📦 Installing Node.js and npm..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Install PostgreSQL client
echo "📦 Installing PostgreSQL client..."
apt install -y postgresql-client

# Verify installations
echo ""
echo "✅ Installation complete! Verifying..."
echo "Node.js version:"
node --version
echo "npm version:"
npm --version
echo "psql version:"
psql --version

echo ""
echo "✅ All requirements installed successfully!"
echo ""
echo "Next steps:"
echo "1. cd /home/moin/Desktop/Mini-olympics"
echo "2. npm install"
echo "3. Create env.local file with your DATABASE_URL"
