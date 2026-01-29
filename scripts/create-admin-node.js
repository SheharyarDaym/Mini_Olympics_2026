#!/usr/bin/env node
/**
 * Create admin user script using Node.js
 * 
 * Usage:
 *   node scripts/create-admin-node.js <username> <password> [role]
 */

const { neon } = require('@neondatabase/serverless');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// Load environment variables
function loadEnv() {
  const envFiles = ['env.local', '.env.local'];
  for (const envFile of envFiles) {
    const envPath = path.join(__dirname, '..', envFile);
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf8');
      content.split('\n').forEach(line => {
        const match = line.match(/^([^#=]+)=(.*)$/);
        if (match) {
          const key = match[1].trim();
          const value = match[2].trim();
          if (key && value && !process.env[key]) {
            process.env[key] = value;
          }
        }
      });
    }
  }
}

loadEnv();

if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL is not set.');
  process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);

function hashPassword(password) {
  const salt = crypto.randomBytes(16);
  const dk = crypto.scryptSync(password, salt, 64);
  return `scrypt:${salt.toString('base64')}:${dk.toString('base64')}`;
}

function generateId() {
  return crypto.randomBytes(16).toString('hex');
}

async function createAdmin() {
  const username = process.argv[2];
  const password = process.argv[3];
  const role = process.argv[4] || 'admin';

  if (!username || !password) {
    console.error('Usage: node scripts/create-admin-node.js <username> <password> [role]');
    process.exit(1);
  }

  console.log(`🔐 Creating admin user: ${username}...\n`);

  try {
    // Ensure admin_users table exists
    await sql`
      CREATE TABLE IF NOT EXISTS admin_users (
        id TEXT PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'admin',
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `;

    const passwordHash = hashPassword(password);
    const id = generateId();

    // Insert or update admin user
    await sql`
      INSERT INTO admin_users (id, username, password_hash, role)
      VALUES (${id}, ${username}, ${passwordHash}, ${role})
      ON CONFLICT (username) DO UPDATE
      SET password_hash = EXCLUDED.password_hash,
          role = EXCLUDED.role,
          updated_at = NOW()
    `;

    console.log(`✅ Admin user created/updated successfully!`);
    console.log(`   Username: ${username}`);
    console.log(`   Role: ${role}`);
    console.log(`\n📋 You can now login at /admin/login`);
  } catch (error) {
    console.error('❌ Failed to create admin user:');
    console.error(error.message);
    process.exit(1);
  }
}

createAdmin();
