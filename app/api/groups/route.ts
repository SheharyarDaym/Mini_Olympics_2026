import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

function interpolate(template: string, vars: Record<string, string>) {
  return template.replace(/\{(\w+)\}/g, (_, key) => vars[key] ?? '');
}

function waLink(phoneRaw: string, text: string) {
  // Expect E.164 without '+', but tolerate formats.
  const phone = phoneRaw.replace(/[^\d]/g, '');
  const encoded = encodeURIComponent(text);
  return `https://wa.me/${phone}?text=${encoded}`;
}

export async function GET(request: NextRequest) {
  try {
    const sp = request.nextUrl.searchParams;
    const gamesParam = sp.get('games') || '';
    const gender = sp.get('gender') || 'boys'; // Default to boys for backward compatibility
    const regNum = sp.get('regNum') || '';
    const name = sp.get('name') || '';
    const roll = sp.get('roll') || '';
    const phone = sp.get('phone') || '';
    const teamName = sp.get('teamName') || '';

    const games = gamesParam
      .split(',')
      .map((g) => g.trim())
      .filter(Boolean);

    if (games.length === 0) {
      return NextResponse.json({ success: true, data: [] });
    }

    // Parameterized query: IN clause for games to avoid driver array quirks
    const gamePlaceholders = games.map((_, i) => `$${i + 1}`).join(', ');
    const paramsWithGender = [...games, gender];
    const genderParamIndex = games.length + 1;
    let queryText = `SELECT game_name, group_title, group_url, coordinator_name, coordinator_phone, message_template
      FROM sport_groups
      WHERE is_active = true AND game_name IN (${gamePlaceholders})`;
    const selectWithGender = `SELECT game_name, gender, group_title, group_url, coordinator_name, coordinator_phone, message_template
      FROM sport_groups
      WHERE is_active = true AND game_name IN (${gamePlaceholders}) AND gender = $${genderParamIndex}
      ORDER BY game_name`;

    let rows: any[];
    try {
      rows = await sql(selectWithGender, paramsWithGender);
    } catch (err: any) {
      const code = err?.code ? String(err.code) : '';
      // 42703 = undefined_column (sport_groups may not have gender if created by older init)
      if (code === '42703') {
        queryText += ' ORDER BY game_name';
        rows = await sql(queryText, games);
      } else {
        throw err;
      }
    }

    const vars = {
      regNum,
      name,
      roll,
      phone,
      teamName,
    };

    const data = (rows as any[]).map((r: any) => {
      const gameName = String(r.game_name);
      const template =
        (r.message_template && String(r.message_template)) ||
        'Assalam o Alaikum, I registered for {game}. My ticket # is {regNum}. Name: {name}, Roll: {roll}, Team: {teamName}.';

      const messageText = interpolate(template, { ...vars, game: gameName });
      const coordinatorPhone = r.coordinator_phone ? String(r.coordinator_phone) : '';

      return {
        gameName,
        gender: r.gender ? String(r.gender) : gender,
        groupTitle: r.group_title ? String(r.group_title) : gameName,
        groupUrl: r.group_url ? String(r.group_url) : null,
        coordinatorName: r.coordinator_name ? String(r.coordinator_name) : null,
        coordinatorPhone: coordinatorPhone || null,
        messageText,
        whatsappUrl: coordinatorPhone ? waLink(coordinatorPhone, messageText) : null,
      };
    });

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to fetch group links', details: error.message },
      { status: 500 }
    );
  }
}
