import type { APIRoute } from 'astro';
import { Resend } from 'resend';

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const LIMITS = {
  firstName:      100,
  lastName:       100,
  email:          254,
  phone:           30,
  projectAddress: 200,
  message:       2000,
} as const;

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  const data = await request.json() as Record<string, unknown>;

  // Reject honeypot submissions (bots fill hidden fields)
  if (data.website) {
    return new Response(JSON.stringify({ error: 'Bad request' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Reject submissions faster than 3 seconds (bot timing)
  const elapsed = Number(data.elapsed ?? 0);
  if (elapsed < 3000) {
    return new Response(JSON.stringify({ error: 'Bad request' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const firstName = String(data.firstName ?? '').trim();
  const lastName  = String(data.lastName  ?? '').trim();
  const email     = String(data.email     ?? '').trim();
  const message   = String(data.message   ?? '').trim();

  if (!firstName || !lastName || !email || !message) {
    return new Response(JSON.stringify({ error: 'Missing required fields' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (!EMAIL_RE.test(email)) {
    return new Response(JSON.stringify({ error: 'Invalid email' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (
    firstName.length > LIMITS.firstName ||
    lastName.length  > LIMITS.lastName  ||
    email.length     > LIMITS.email     ||
    message.length   > LIMITS.message
  ) {
    return new Response(JSON.stringify({ error: 'Input too long' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const rawPhone   = String(data.phone          ?? '').trim();
  const rawAddress = String(data.projectAddress ?? '').trim();

  if (rawPhone.length > LIMITS.phone || rawAddress.length > LIMITS.projectAddress) {
    return new Response(JSON.stringify({ error: 'Input too long' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const phone           = rawPhone   || '—';
  const projectAddress  = rawAddress || '—';
  const preferredContact = String(data.preferredContact ?? '') || '—';
  const source          = String(data.source          ?? '') || '—';

  const resend     = new Resend(import.meta.env.RESEND_API_KEY);
  const toEmail    = import.meta.env.CONTACT_TO_EMAIL;
  const fromEmail  = import.meta.env.CONTACT_FROM_EMAIL ?? 'onboarding@resend.dev';

  const rows = [
    ['Name',              `${escapeHtml(firstName)} ${escapeHtml(lastName)}`],
    ['Email',             `<a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a>`],
    ['Phone',             escapeHtml(phone)],
    ['Project Address',   escapeHtml(projectAddress)],
    ['Preferred Contact', escapeHtml(preferredContact)],
    ['Source',            escapeHtml(source)],
  ];

  const tableRows = rows
    .map(([k, v]) => `<tr><td style="padding:4px 16px 4px 0;font-weight:600;white-space:nowrap">${k}</td><td style="padding:4px 0">${v}</td></tr>`)
    .join('');

  const html = `
    <div style="font-family:sans-serif;color:#2C2A28;max-width:600px">
      <h2 style="margin-bottom:16px">New inquiry from ${escapeHtml(firstName)} ${escapeHtml(lastName)}</h2>
      <table style="border-collapse:collapse;margin-bottom:24px">${tableRows}</table>
      <h3 style="margin-bottom:8px">Message</h3>
      <p style="white-space:pre-wrap;background:#f5f3f0;padding:16px;border-radius:4px">${escapeHtml(message)}</p>
    </div>
  `;

  try {
    await resend.emails.send({
      from: `Florencia Nieto <${fromEmail}>`,
      to: toEmail,
      replyTo: email,
      subject: `New inquiry from ${firstName} ${lastName}`,
      html,
    });

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Resend error:', err);
    return new Response(JSON.stringify({ error: 'Failed to send email' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
