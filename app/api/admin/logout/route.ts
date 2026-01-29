import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('admin_session')?.value;

    if (sessionToken) {
      // Delete session from database
      await sql`DELETE FROM admin_sessions WHERE session_token = ${sessionToken}`;
    }

    // Clear cookie
    const response = NextResponse.json({ success: true, message: 'Logged out successfully' });
    response.cookies.delete('admin_session');
    
    return response;
  } catch (error: any) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Logout failed', details: error.message },
      { status: 500 }
    );
  }
}

