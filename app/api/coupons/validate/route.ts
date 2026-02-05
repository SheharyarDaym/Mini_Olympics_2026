import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const noCacheHeaders = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
  'Pragma': 'no-cache',
};

/** GET ?code=XXX - Validate coupon (public). Always reads from DB — no caching. Returns { valid, discountPercent } or { valid: false, error } */
export async function GET(request: NextRequest) {
  try {
    const code = request.nextUrl.searchParams.get('code')?.trim().toUpperCase();
    if (!code) {
      const res = NextResponse.json({ valid: false, error: 'Coupon code is required' }, { status: 400 });
      Object.entries(noCacheHeaders).forEach(([k, v]) => res.headers.set(k, v));
      return res;
    }

    // Always query DB for current coupon (code is unique; only active ones count)
    const rows = await sql`
      SELECT id, discount_percent, is_active
      FROM coupons
      WHERE UPPER(TRIM(code)) = ${code} AND is_active = true
      LIMIT 1
    ` as any[];

    if (!rows || rows.length === 0) {
      const res = NextResponse.json({ valid: false, error: 'Invalid coupon code' });
      Object.entries(noCacheHeaders).forEach(([k, v]) => res.headers.set(k, v));
      return res;
    }

    const coupon = rows[0];
    const discountPercent = Number(coupon.discount_percent) || 0;
    if (discountPercent <= 0 || discountPercent > 100) {
      const res = NextResponse.json({ valid: false, error: 'Invalid discount' });
      Object.entries(noCacheHeaders).forEach(([k, v]) => res.headers.set(k, v));
      return res;
    }

    const res = NextResponse.json({
      valid: true,
      discountPercent,
    });
    Object.entries(noCacheHeaders).forEach(([k, v]) => res.headers.set(k, v));
    return res;
  } catch (error: any) {
    // If coupons table doesn't exist yet, return invalid
    if (error?.message?.includes('relation "coupons"') || error?.code === '42P01') {
      const r = NextResponse.json({ valid: false, error: 'Invalid coupon code' }, { status: 500 });
      Object.entries(noCacheHeaders).forEach(([k, v]) => r.headers.set(k, v));
      return r;
    }
    console.error('Coupon validate error:', error);
    const r = NextResponse.json({ valid: false, error: 'Could not validate coupon' }, { status: 500 });
    Object.entries(noCacheHeaders).forEach(([k, v]) => r.headers.set(k, v));
    return r;
  }
}
