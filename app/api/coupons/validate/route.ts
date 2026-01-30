import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export const dynamic = 'force-dynamic';

/** GET ?code=XXX - Validate coupon (public). Returns { valid, discountPercent } or { valid: false, error } */
export async function GET(request: NextRequest) {
  try {
    const code = request.nextUrl.searchParams.get('code')?.trim().toUpperCase();
    if (!code) {
      return NextResponse.json({ valid: false, error: 'Coupon code is required' }, { status: 400 });
    }

    const rows = await sql`
      SELECT id, code, discount_percent, is_active
      FROM coupons
      WHERE UPPER(TRIM(code)) = ${code}
      LIMIT 1
    ` as any[];

    if (!rows || rows.length === 0) {
      return NextResponse.json({ valid: false, error: 'Invalid coupon code' });
    }

    const coupon = rows[0];
    if (!coupon.is_active) {
      return NextResponse.json({ valid: false, error: 'This coupon is no longer active' });
    }

    const discountPercent = Number(coupon.discount_percent) || 0;
    if (discountPercent <= 0 || discountPercent > 100) {
      return NextResponse.json({ valid: false, error: 'Invalid discount' });
    }

    return NextResponse.json({
      valid: true,
      discountPercent,
    });
  } catch (error: any) {
    // If coupons table doesn't exist yet, return invalid
    if (error?.message?.includes('relation "coupons"') || error?.code === '42P01') {
      return NextResponse.json({ valid: false, error: 'Invalid coupon code' });
    }
    console.error('Coupon validate error:', error);
    return NextResponse.json({ valid: false, error: 'Could not validate coupon' }, { status: 500 });
  }
}
