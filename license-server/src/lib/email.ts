import type { Env, Tier } from '../types';
import { signDownloadToken } from './downloads';

interface SendArgs {
  to: string;
  subject: string;
  html: string;
  text: string;
}

export async function sendEmail(env: Env, args: SendArgs): Promise<void> {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: env.RESEND_FROM_EMAIL,
      to: [args.to],
      subject: args.subject,
      html: args.html,
      text: args.text,
    }),
  });
  if (!res.ok) {
    throw new Error(`resend_failed: ${res.status} ${await res.text()}`);
  }
}

/**
 * Build short-lived signed download URLs for installer binaries.
 *
 * The URL points at the marketing site's /download/:platform Pages Function, which
 * verifies the HMAC token and streams the file from R2. Keeping downloads on the
 * marketing origin avoids an extra CSP entry and lets Cloudflare Access gate them
 * later if needed.
 */
export async function buildInstallerUrls(env: Env, email: string): Promise<Record<string, string>> {
  const ttl = Number(env.INSTALLER_URL_TTL_SECONDS);
  const expires = Math.floor(Date.now() / 1000) + ttl;
  const platforms = ['macos', 'windows', 'linux'] as const;
  const out: Record<string, string> = {};
  for (const platform of platforms) {
    const token = await signDownloadToken(env, { platform, email, expires });
    out[platform] = `${env.APP_URL}/download/${platform}?t=${token}&e=${expires}`;
  }
  return out;
}

export function fulfillmentEmail(args: {
  tier: Tier;
  customer_email: string;
  tokens: string[];
  installers: Record<string, string>;
  portal_url: string;
}): { subject: string; html: string; text: string } {
  const isTrial = args.tier === 'trial';
  const label = isTrial
    ? 'Trial'
    : args.tier === 'solo'
      ? 'Solo'
      : args.tier === 'practice'
        ? 'Practice'
        : 'Enterprise';

  const subject = isTrial
    ? 'Your 10-day Psygil trial is ready'
    : `Your Psygil ${label} subscription is active`;

  const heading = isTrial
    ? 'Your 10-day trial is ready.'
    : 'Welcome to Psygil.';

  const lead = isTrial
    ? 'Install Psygil, paste the license key on first launch, and work through a real evaluation. The trial runs 10 days from activation, with every feature unlocked. Upgrade any time from inside the app and keep your data.'
    : `Your ${label} subscription is active. Your license key${args.tokens.length > 1 ? 's are' : ' is'} below.`;

  const tokenRows = args.tokens
    .map((t, i) => (args.tokens.length === 1 ? `License key:\n  ${t}` : `Seat ${i + 1}:\n  ${t}`))
    .join('\n\n');

  const billingBlock = isTrial
    ? 'Upgrade from the app or at https://psygil.com/pricing — the trial seat converts to your paid seat automatically.'
    : `Manage billing, update card, or cancel: ${args.portal_url}

Cancellations take effect at the end of the current billing period. All sales are final.`;

  const text = `${heading}

${lead}

${tokenRows}

Install Psygil:
  macOS     ${args.installers.macos}
  Windows   ${args.installers.windows}
  Linux     ${args.installers.linux}

Paste the license key on first launch. Each key binds to one workstation.

${billingBlock}

Questions: support@psygil.com

- Foundry SMB
`;

  const billingHtml = isTrial
    ? `<p style="margin:0 0 20px;"><a href="https://psygil.com/pricing" style="display:inline-block;background:#E8650A;color:#fff;padding:10px 16px;border-radius:4px;text-decoration:none;font-weight:600;">Upgrade to paid</a></p>`
    : `<p style="margin:0 0 20px;"><a href="${args.portal_url}" style="display:inline-block;background:#E8650A;color:#fff;padding:10px 16px;border-radius:4px;text-decoration:none;font-weight:600;">Manage billing</a></p>
<p style="margin:0 0 8px;color:#666;font-size:13px;">Cancellations take effect at the end of the current billing period. All sales are final.</p>`;

  const html = `<!doctype html><html><body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Inter,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#111;line-height:1.55;">
<h1 style="font-size:22px;margin:0 0 8px;">${heading}</h1>
<p style="margin:0 0 20px;color:#444;">${lead}</p>
<div style="background:#f6f6f4;border:1px solid #e6e4de;border-radius:6px;padding:16px;font-family:'JetBrains Mono',ui-monospace,monospace;font-size:13px;white-space:pre-wrap;margin-bottom:20px;">${escapeHtml(tokenRows)}</div>
<h2 style="font-size:15px;margin:20px 0 8px;">Install Psygil</h2>
<ul style="padding-left:18px;margin:0 0 20px;">
  <li><a href="${args.installers.macos}">macOS</a></li>
  <li><a href="${args.installers.windows}">Windows</a></li>
  <li><a href="${args.installers.linux}">Linux</a></li>
</ul>
<p style="margin:0 0 20px;color:#444;">Paste the license key on first launch. Each key binds to one workstation.</p>
${billingHtml}
<p style="margin:0;color:#666;font-size:13px;">Questions: <a href="mailto:support@psygil.com">support@psygil.com</a></p>
</body></html>`;

  return { subject, html, text };
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
