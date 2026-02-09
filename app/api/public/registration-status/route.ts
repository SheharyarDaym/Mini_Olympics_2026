import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/** Public: GET whether registrations are open. Default true if not set. */
export async function GET() {
  try {
    const rows = await sql`
      SELECT value FROM system_settings WHERE key = 'registrations_open' LIMIT 1
    ` as any[];
    const value = rows?.[0]?.value;
    const open = value !== 'false' && value !== '0';
    return NextResponse.json({ success: true, open: !!open });
  } catch (_) {
    return NextResponse.json({ success: true, open: true });
  }
}
