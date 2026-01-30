import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { getAdminSession } from '@/lib/auth';
import { cookies } from 'next/headers';
import { v4 as uuidv4 } from 'uuid';

export const dynamic = 'force-dynamic';

function isCouponsTableMissing(error: any): boolean {
  return error?.code === '42P01' || (error?.message && String(error.message).includes('relation "coupons"'));
}

/** Create coupons table and add coupon_code to registrations if missing. Safe to run multiple times. */
async function runCouponsMigration(): Promise<void> {
  await sql`
    CREATE TABLE IF NOT EXISTS coupons (
      id TEXT PRIMARY KEY,
      code VARCHAR(50) NOT NULL UNIQUE,
      discount_percent DECIMAL(5, 2) NOT NULL CHECK (discount_percent > 0 AND discount_percent <= 100),
      is_active BOOLEAN NOT NULL DEFAULT true,
      created_at TIMESTAMP DEFAULT NOW() NOT NULL
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons(code)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_coupons_is_active ON coupons(is_active)`;
  await sql`ALTER TABLE registrations ADD COLUMN IF NOT EXISTS coupon_code VARCHAR(50)`;
}

// GET - List all coupons (auto-runs migration if table missing)
export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('admin_session')?.value;
    const session = await getAdminSession(sessionId);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.role !== 'super_admin') {
      return NextResponse.json({ error: 'Forbidden - Super Admin only' }, { status: 403 });
    }

    let rows: any[];
    try {
      rows = await sql`
        SELECT id, code, discount_percent, is_active, created_at
        FROM coupons
        ORDER BY created_at DESC
      ` as any[];
    } catch (firstErr: any) {
      if (!isCouponsTableMissing(firstErr)) throw firstErr;
      await runCouponsMigration();
      rows = await sql`
        SELECT id, code, discount_percent, is_active, created_at
        FROM coupons
        ORDER BY created_at DESC
      ` as any[];
    }

    return NextResponse.json({ success: true, data: rows });
  } catch (error: any) {
    console.error('Fetch coupons error:', error);
    return NextResponse.json({ error: 'Failed to fetch coupons', details: error.message }, { status: 500 });
  }
}

// POST - Create coupon
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('admin_session')?.value;
    const session = await getAdminSession(sessionId);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.role !== 'super_admin') {
      return NextResponse.json({ error: 'Forbidden - Super Admin only' }, { status: 403 });
    }

    const body = await request.json();
    const code = String(body.code || '').trim().toUpperCase();
    const discountPercent = Number(body.discount_percent ?? body.discountPercent ?? 0);

    if (!code) {
      return NextResponse.json({ error: 'Coupon code is required' }, { status: 400 });
    }
    if (isNaN(discountPercent) || discountPercent <= 0 || discountPercent > 100) {
      return NextResponse.json({ error: 'Discount percent must be between 1 and 100' }, { status: 400 });
    }

    const id = uuidv4();
    try {
      await sql`
        INSERT INTO coupons (id, code, discount_percent, is_active, created_at)
        VALUES (${id}, ${code}, ${discountPercent}, true, NOW())
      `;
    } catch (insertErr: any) {
      if (isCouponsTableMissing(insertErr)) {
        await runCouponsMigration();
        await sql`
          INSERT INTO coupons (id, code, discount_percent, is_active, created_at)
          VALUES (${id}, ${code}, ${discountPercent}, true, NOW())
        `;
      } else {
        throw insertErr;
      }
    }

    return NextResponse.json({ success: true, data: { id, code, discount_percent: discountPercent, is_active: true } });
  } catch (error: any) {
    if (error?.code === '23505') {
      return NextResponse.json({ error: 'This coupon code already exists' }, { status: 400 });
    }
    console.error('Create coupon error:', error);
    return NextResponse.json({ error: 'Failed to create coupon', details: error.message }, { status: 500 });
  }
}

// DELETE - Deactivate or delete coupon (query param: id)
export async function DELETE(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('admin_session')?.value;
    const session = await getAdminSession(sessionId);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.role !== 'super_admin') {
      return NextResponse.json({ error: 'Forbidden - Super Admin only' }, { status: 403 });
    }

    const id = request.nextUrl.searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Coupon id is required' }, { status: 400 });
    }

    await sql`DELETE FROM coupons WHERE id = ${id}`;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Delete coupon error:', error);
    return NextResponse.json({ error: 'Failed to delete coupon', details: error.message }, { status: 500 });
  }
}
