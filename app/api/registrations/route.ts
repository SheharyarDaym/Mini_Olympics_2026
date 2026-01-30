import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
import { sendRegistrationSubmittedEmail } from '@/lib/email';

// Generate cash slip ID
function generateSlipId(): string {
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `MO26-CASH-${randomNum}`;
}

// Generate online payment reference ID
function generateOnlineRefId(): string {
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `MO26-ONLINE-${randomNum}`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// POST - Create new registration
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      email,
      name,
      rollNumber,
      contactNumber,
      alternativeContactNumber,
      gender,
      teamName,
      selectedGames,
      teamMembers,
      totalAmount,
      paymentMethod,
      transactionId,
      screenshotUrl,
      couponCode,
      discount: discountFromBody,
    } = body;

    // Validate required fields
    if (!email || !name || !rollNumber || !contactNumber || !gender || !teamName || !selectedGames || !Array.isArray(selectedGames) || selectedGames.length === 0 || !paymentMethod || totalAmount === undefined || totalAmount === null) {
      return NextResponse.json(
        { error: 'Missing required fields', received: body },
        { status: 400 }
      );
    }

    // Check if team name is unique
    const existingTeam = await sql`
      SELECT id, team_name FROM registrations 
      WHERE LOWER(team_name) = LOWER(${teamName})
      LIMIT 1
    ` as any[];
    
    if (existingTeam && existingTeam.length > 0) {
      return NextResponse.json(
        { error: 'Team name already exists. Please choose a unique team name.', field: 'teamName' },
        { status: 400 }
      );
    }

    const id = uuidv4();
    const slipId = paymentMethod === 'cash' ? generateSlipId() : generateOnlineRefId();
    const status = paymentMethod === 'cash' ? 'pending_cash' : 'pending_online';

    // Prepare data
    const selectedGamesJson = JSON.stringify(selectedGames);
    const teamMembersJson = teamMembers ? JSON.stringify(teamMembers) : null;
    const totalAmountNum = Number(totalAmount);

    // Coupon: validate if code provided and compute discount
    let discountNum = Number(discountFromBody) || 0;
    let couponCodeToStore: string | null = null;
    if (couponCode && String(couponCode).trim()) {
      const code = String(couponCode).trim().toUpperCase();
      try {
        const couponRows = await sql`
          SELECT id, discount_percent, is_active FROM coupons
          WHERE UPPER(TRIM(code)) = ${code} AND is_active = true
          LIMIT 1
        ` as any[];
        if (couponRows && couponRows.length > 0) {
          const pct = Number(couponRows[0].discount_percent) || 0;
          if (pct > 0 && pct <= 100) {
            discountNum = Math.round((totalAmountNum * pct) / 100 * 100) / 100;
            couponCodeToStore = code;
          }
        }
      } catch (_) {
        // coupons table may not exist; ignore and use discountFromBody or 0
      }
    }
    if (discountNum < 0) discountNum = 0;
    if (discountNum > totalAmountNum) discountNum = totalAmountNum;

    console.log('Inserting registration:', {
      email,
      name,
      rollNumber,
      gender,
      teamName,
      selectedGamesCount: selectedGames.length,
      teamMembersCount: teamMembers ? Object.keys(teamMembers).length : 0,
      totalAmount: totalAmountNum,
      paymentMethod,
      discount: discountNum,
      couponCode: couponCodeToStore,
    });

    // Insert registration (discount always; coupon_code only if column exists)
    let result: any[];
    try {
      result = await sql`
        INSERT INTO registrations (
          id, email, name, roll_number, contact_number, alternative_contact_number,
          gender, team_name, selected_games, team_members, total_amount, discount, coupon_code, payment_method, slip_id, transaction_id,
          screenshot_url, status, created_at, updated_at
        ) VALUES (
          ${id}, ${email}, ${name}, ${rollNumber}, ${contactNumber}, ${alternativeContactNumber || null},
          ${gender}, ${teamName}, ${selectedGamesJson}, ${teamMembersJson}, ${totalAmountNum}, ${discountNum}, ${couponCodeToStore}, ${paymentMethod}, ${slipId}, ${transactionId || null},
          ${screenshotUrl || null}, ${status}, NOW(), NOW()
        )
        RETURNING registration_number
      ` as any[];
    } catch (insertErr: any) {
      if (insertErr?.code === '42703' && insertErr?.message?.includes('coupon_code')) {
        result = await sql`
          INSERT INTO registrations (
            id, email, name, roll_number, contact_number, alternative_contact_number,
            gender, team_name, selected_games, team_members, total_amount, discount, payment_method, slip_id, transaction_id,
            screenshot_url, status, created_at, updated_at
          ) VALUES (
            ${id}, ${email}, ${name}, ${rollNumber}, ${contactNumber}, ${alternativeContactNumber || null},
            ${gender}, ${teamName}, ${selectedGamesJson}, ${teamMembersJson}, ${totalAmountNum}, ${discountNum}, ${paymentMethod}, ${slipId}, ${transactionId || null},
            ${screenshotUrl || null}, ${status}, NOW(), NOW()
          )
          RETURNING registration_number
        ` as any[];
      } else {
        throw insertErr;
      }
    }

    const registrationNumber = result[0]?.registration_number;

    // Send "registration submitted" email (do not fail response if email fails)
    try {
      const gamesListHtml = (selectedGames as string[]).map((g: string) => `<li>${escapeHtml(g)}</li>`).join('');
      await sendRegistrationSubmittedEmail({
        to: email,
        name: name,
        regNum: registrationNumber ?? '',
        slipId,
        paymentMethod: paymentMethod === 'cash' ? 'cash' : 'online',
        teamName: teamName,
        gamesList: gamesListHtml,
      });
    } catch (emailErr: any) {
      console.error('Registration submitted email failed:', emailErr?.message || emailErr);
    }

    return NextResponse.json({
      success: true,
      registrationId: id,
      registrationNumber,
      slipId: slipId,
      status,
      totalAmount: Number(totalAmount),
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      detail: error.detail,
      hint: error.hint,
    });
    return NextResponse.json(
      { error: 'Failed to create registration', details: error.message, code: error.code },
      { status: 500 }
    );
  }
}

// Force dynamic rendering and disable caching
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// GET - Fetch all registrations (admin only)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const paymentMethod = searchParams.get('paymentMethod');
    const gender = searchParams.get('gender');
    const game = searchParams.get('game');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    console.log('API Filters received:', { status, paymentMethod, gender, game, startDate, endDate });

    // Build query with all filters using parameterized SQL (avoids nested template issues)
    let queryText = 'SELECT * FROM registrations';
    const whereClauses: string[] = [];
    const params: any[] = [];

    if (status) {
      params.push(status);
      whereClauses.push(`status = $${params.length}`);
    }
    if (paymentMethod) {
      params.push(paymentMethod);
      whereClauses.push(`payment_method = $${params.length}`);
    }
    if (gender) {
      params.push(gender);
      whereClauses.push(`gender = $${params.length}`);
    }
    if (startDate) {
      // Compare against created_date column (DATE type)
      params.push(startDate);
      whereClauses.push(`created_date >= $${params.length}`);
    }
    if (endDate) {
      params.push(endDate);
      whereClauses.push(`created_date <= $${params.length}`);
    }

    if (whereClauses.length > 0) {
      queryText += ' WHERE ' + whereClauses.join(' AND ');
    }
    queryText += ' ORDER BY created_at DESC';

    // Use the generic query helper to execute parameterized SQL
    const registrations = await sql(queryText, params) as any[];
    console.log(`Found ${registrations.length} registrations before game filter`);

    // Parse selected_games JSON for each registration
    let parsedRegistrations = registrations.map((reg: any) => {
      let selectedGames: string[] = [];
      try {
        if (typeof reg.selected_games === 'string') {
          selectedGames = JSON.parse(reg.selected_games);
        } else if (Array.isArray(reg.selected_games)) {
          selectedGames = reg.selected_games;
        }
      } catch (e) {
        selectedGames = [];
      }
      return {
        ...reg,
        selected_games: selectedGames,
      };
    });

    // Filter by game if specified (client-side filtering for JSON field)
    if (game) {
      const beforeCount = parsedRegistrations.length;
      parsedRegistrations = parsedRegistrations.filter((reg: any) => {
        return Array.isArray(reg.selected_games) && reg.selected_games.includes(game);
      });
      console.log(`Game filter "${game}": ${beforeCount} -> ${parsedRegistrations.length} registrations`);
    }

    console.log(`Returning ${parsedRegistrations.length} filtered registrations`);
    return NextResponse.json({ success: true, data: parsedRegistrations });
  } catch (error: any) {
    console.error('Fetch registrations error:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      detail: error.detail,
      hint: error.hint,
      stack: error.stack,
    });
    return NextResponse.json(
      { 
        error: 'Failed to fetch registrations', 
        details: error.message,
        hint: error.hint || 'Check server console for full error details'
      },
      { status: 500 }
    );
  }
}
