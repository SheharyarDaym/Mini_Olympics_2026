import { sql } from '@/lib/db';
import nodemailer from 'nodemailer';

export type SmtpSettings = Record<string, string>;

export async function getSmtpSettings(): Promise<SmtpSettings> {
  const rows = await sql`SELECT key, value FROM system_settings WHERE key LIKE 'smtp_%'`;
  const map: SmtpSettings = {};
  (rows as any[]).forEach((r: any) => {
    map[r.key] = r.value || '';
  });
  return map;
}

export async function getEmailTemplate(key: string): Promise<string | null> {
  const rows = await sql`SELECT value FROM system_settings WHERE key = ${key}`;
  const v = (rows as any[])?.[0]?.value;
  return v != null ? String(v) : null;
}

export async function sendMail(options: {
  to: string;
  subject: string;
  html: string;
  fromName?: string;
}): Promise<void> {
  const settings = await getSmtpSettings();
  if (!settings.smtp_email || !settings.smtp_password) {
    throw new Error('SMTP not configured. Configure in Admin → Settings.');
  }
  const transporter = nodemailer.createTransport({
    host: settings.smtp_host || 'smtp.gmail.com',
    port: parseInt(settings.smtp_port || '587', 10),
    secure: settings.smtp_port === '465',
    auth: {
      user: settings.smtp_email,
      pass: settings.smtp_password,
    },
  });
  const fromName = options.fromName || settings.smtp_from_name || 'FCIT Sports Society';
  await transporter.sendMail({
    from: `"${fromName}" <${settings.smtp_email}>`,
    to: options.to,
    subject: options.subject,
    html: options.html,
  });
}

/** Replace {{name}}, {{regNum}}, etc. in template */
export function interpolateTemplate(template: string, vars: Record<string, string>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] ?? '');
}

/** Email footer: use character/symbol links so icons show in all clients (many block data-URI images) */
const EMAIL_FOOTER_ICONS = `
      <p style="margin: 0;">
        <a href="mailto:sports.oc@pucit.edu.pk" style="color: #64748b; text-decoration: none; font-size: 18px; margin: 0 8px;" title="Email">✉︎</a>
        <a href="https://facebook.com/PucitSSOldCampus/" style="color: #64748b; text-decoration: none; font-size: 18px; margin: 0 8px;" title="Facebook">ⓕ</a>
        <a href="https://instagram.com/fcit_oc_sports" style="color: #64748b; text-decoration: none; font-size: 18px; margin: 0 8px;" title="Instagram">📷</a>
        <a href="https://linkedin.com/company/fcit-sports-society-oc/" style="color: #64748b; text-decoration: none; font-size: 18px; margin: 0 8px;" title="LinkedIn">🔗</a>
      </p>
`;

/** Wrap inner HTML in the same card layout as the Email Composer (header + content + footer) */
function wrapEmailCard(contentHtml: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <div style="background: linear-gradient(135deg, #f59e0b 0%, #ef4444 100%); border-radius: 16px 16px 0 0; padding: 32px; text-align: center; color: white;">
      <div style="font-size: 48px; margin-bottom: 16px;">🏆</div>
      <h1 style="margin: 0 0 8px 0; font-size: 24px; font-weight: 700;">Mini Olympics 2026</h1>
      <p style="margin: 0; opacity: 0.9; font-size: 14px;">FCIT Sports Society</p>
    </div>
    <div style="background: white; border-radius: 0 0 16px 16px; padding: 32px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
      <div style="color: #334155; line-height: 1.7; font-size: 15px;">
        ${contentHtml}
      </div>
      <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #e2e8f0;">
        <p style="margin: 0; color: #64748b; font-size: 14px;">
          Best regards,<br>
          <strong style="color: #334155;">FCIT Sports Society</strong>
        </p>
      </div>
    </div>
    <div style="text-align: center; margin-top: 24px; color: #94a3b8; font-size: 12px;">
      <p style="margin: 0 0 12px 0;">© 2026 <a href="https://pucit.edu.pk" style="color: #3b82f6; text-decoration: none; font-weight: 600;">FCIT Sports Society</a>. All rights reserved.</p>
${EMAIL_FOOTER_ICONS}
    </div>
  </div>
</body>
</html>
  `.trim();
}

/** Single subject for all registration emails so they stay in one thread */
const EMAIL_SUBJECT_ALL = 'Mini Olympics 2026 Registration';

const DEFAULT_REGISTRATION_SUBMITTED_BODY = `
<h2>Welcome to Mini Olympics 2026! 🏆</h2>
<p>Dear {{name}},</p>
<p>Thank you for registering for the FCIT Sports Mini Olympics 2026. We're excited to have you on board!</p>
<p>Your registration has been received and is currently being processed.</p>
<p><strong>Ticket #:</strong> {{regNum}}</p>
<p><strong>Reference / Slip ID:</strong> {{slipId}}</p>
<p><strong>Team name:</strong> {{teamName}}</p>
<p><strong>Registered game(s):</strong></p>
<ul>
{{gamesList}}
</ul>
<p><strong>What's Next?</strong></p>
<ul>
  <li>{{paymentNext}}</li>
  <li>Join the WhatsApp groups for your registered games</li>
  <li>Stay tuned for match schedules</li>
</ul>
<p>Good luck and may the best athlete win!</p>
`;

const DEFAULT_PAYMENT_RECEIVED_BODY = `
<h2>Payment Confirmed ✅</h2>
<p>Dear {{name}},</p>
<p>Your payment for <strong>Mini Olympics 2026</strong> has been received and verified.</p>
<p><strong>Ticket #:</strong> {{regNum}}</p>
<p><strong>Reference ID:</strong> {{slipId}}</p>
<p>You are all set. We look forward to seeing you at the event.</p>
`;

const DEFAULT_PAYMENT_NOT_RECEIVED_BODY = `
<h2>Payment Verification Required</h2>
<p>Dear {{name}},</p>
<p>We were unable to verify your payment for <strong>Mini Olympics 2026</strong> (Ticket #{{regNum}}).</p>
<p><strong>Reference ID:</strong> {{slipId}}</p>
<p>{{paymentAction}}</p>
`;

const PAYMENT_NEXT_CASH = 'Please bring the cash to the desk to complete your registration.';
const PAYMENT_NEXT_ONLINE = 'Please share your payment receipt in reply to this email to complete verification.';
const PAYMENT_ACTION_CASH = 'Please bring the cash to the desk to complete your registration.';
const PAYMENT_ACTION_ONLINE = 'If you have already paid, please share your payment receipt in reply to this email. Otherwise, please complete your payment and share the receipt in reply.';

export async function sendRegistrationSubmittedEmail(params: {
  to: string;
  name: string;
  regNum: string | number;
  slipId: string;
  paymentMethod: 'cash' | 'online';
  teamName: string;
  gamesList: string; // HTML list items, e.g. "<li>FIFA</li><li>Tekken</li>"
}): Promise<void> {
  const s = await getEmailTemplate('email_registration_submitted_subject');
  const subject = (s != null && s.trim() !== '') ? s : EMAIL_SUBJECT_ALL;
  const b = await getEmailTemplate('email_registration_submitted_body');
  const bodyTemplate = (b != null && b.trim() !== '') ? b : DEFAULT_REGISTRATION_SUBMITTED_BODY;
  const paymentNext = params.paymentMethod === 'cash' ? PAYMENT_NEXT_CASH : PAYMENT_NEXT_ONLINE;
  const innerHtml = interpolateTemplate(bodyTemplate, {
    name: params.name,
    regNum: String(params.regNum),
    slipId: params.slipId,
    paymentNext,
    teamName: params.teamName,
    gamesList: params.gamesList,
  });
  const html = wrapEmailCard(innerHtml);
  await sendMail({ to: params.to, subject, html });
}

export async function sendPaymentReceivedEmail(params: { to: string; name: string; regNum: string | number; slipId: string }): Promise<void> {
  const s = await getEmailTemplate('email_payment_received_subject');
  const subject = (s != null && s.trim() !== '') ? s : EMAIL_SUBJECT_ALL;
  const b = await getEmailTemplate('email_payment_received_body');
  const bodyTemplate = (b != null && b.trim() !== '') ? b : DEFAULT_PAYMENT_RECEIVED_BODY;
  const innerHtml = interpolateTemplate(bodyTemplate, {
    name: params.name,
    regNum: String(params.regNum),
    slipId: params.slipId,
  });
  const html = wrapEmailCard(innerHtml);
  await sendMail({ to: params.to, subject, html });
}

export async function sendPaymentNotReceivedEmail(params: {
  to: string;
  name: string;
  regNum: string | number;
  slipId: string;
  paymentMethod?: 'cash' | 'online';
}): Promise<void> {
  const s = await getEmailTemplate('email_payment_rejected_subject');
  const subject = (s != null && s.trim() !== '') ? s : EMAIL_SUBJECT_ALL;
  const b = await getEmailTemplate('email_payment_rejected_body');
  const bodyTemplate = (b != null && b.trim() !== '') ? b : DEFAULT_PAYMENT_NOT_RECEIVED_BODY;
  const paymentAction = (params.paymentMethod === 'online') ? PAYMENT_ACTION_ONLINE : PAYMENT_ACTION_CASH;
  const innerHtml = interpolateTemplate(bodyTemplate, {
    name: params.name,
    regNum: String(params.regNum),
    slipId: params.slipId,
    paymentAction,
  });
  const html = wrapEmailCard(innerHtml);
  await sendMail({ to: params.to, subject, html });
}
