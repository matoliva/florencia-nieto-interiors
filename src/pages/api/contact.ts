import type { APIRoute } from 'astro';
import { Resend } from 'resend';

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  const data = await request.json() as Record<string, string>;

  const firstName = data.firstName?.trim()  ?? '';
  const lastName  = data.lastName?.trim()   ?? '';
  const email     = data.email?.trim()      ?? '';
  const message   = data.message?.trim()    ?? '';

  if (!firstName || !lastName || !email || !message) {
    return new Response(JSON.stringify({ error: 'Missing required fields' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const phone           = data.phone?.trim()           || '—';
  const projectAddress  = data.projectAddress?.trim()  || '—';
  const preferredContact = data.preferredContact       || '—';
  const source          = data.source                  || '—';

  const resend  = new Resend(import.meta.env.RESEND_API_KEY);
  const toEmail = import.meta.env.CONTACT_TO_EMAIL;

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
      from: 'Florencia Nieto Website <onboarding@resend.dev>',
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
