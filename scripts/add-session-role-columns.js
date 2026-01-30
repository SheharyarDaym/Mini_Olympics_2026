#!/usr/bin/env node
/**
 * Add admin_user_id and role columns to admin_sessions if missing.
 * Run from project root. Uses DATABASE_URL from .env.local or .env.
 */
const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

function loadEnv() {
  const envFiles = ['env.local', '.env.local', '.env'];
  for (const envFile of envFiles) {
    const envPath = path.join(__dirname, '..', envFile);
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf8');
      content.split('\n').forEach(line => {
        const match = line.match(/^([^#=]+)=(.*)$/);
        if (match) {
          const key = match[1].trim();
          const value = match[2].trim();
          if (key && value && !process.env[key]) process.env[key] = value;
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

async function run() {
  try {
    await sql`ALTER TABLE admin_sessions ADD COLUMN IF NOT EXISTS admin_user_id TEXT`;
    console.log('✅ admin_sessions.admin_user_id added (or already exists)');
    await sql`ALTER TABLE admin_sessions ADD COLUMN IF NOT EXISTS role TEXT`;
    console.log('✅ admin_sessions.role added (or already exists)');
    await sql`
      CREATE TABLE IF NOT EXISTS match_schedules (
        id TEXT PRIMARY KEY,
        game_name TEXT NOT NULL,
        gender TEXT NOT NULL CHECK (gender IN ('boys', 'girls')),
        schedule_data TEXT,
        generated_by TEXT,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `;
    console.log('✅ match_schedules table ensured');
    await sql`ALTER TABLE sport_groups ADD COLUMN IF NOT EXISTS gender TEXT NOT NULL DEFAULT 'boys'`;
    console.log('✅ sport_groups.gender column ensured');
    // Switch unique constraint from (game_name) to (game_name, gender) so ON CONFLICT works
    try {
      await sql`ALTER TABLE sport_groups DROP CONSTRAINT IF EXISTS sport_groups_game_name_key`;
      await sql`ALTER TABLE sport_groups ADD CONSTRAINT sport_groups_game_name_gender_key UNIQUE (game_name, gender)`;
      console.log('✅ sport_groups unique constraint (game_name, gender) ensured');
    } catch (e) {
      const msg = e.message || '';
      if (msg.includes('already exists') || msg.includes('duplicate key')) {
        console.log('ℹ️  sport_groups constraint already in place or has duplicates');
      } else {
        console.log('ℹ️  sport_groups constraint:', msg);
      }
    }
    console.log('Done. Log out and log back in as hoi/hof so the session stores your role.');
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
    process.exit(1);
  }
}
run();
