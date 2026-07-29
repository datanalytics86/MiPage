/**
 * Transactional email helper (Resend).
 * No-ops safely when RESEND_API_KEY is missing (local/dev).
 */

export type EmailTemplate =
  | 'provider_approved'
  | 'provider_rejected'
  | 'provider_pending'
  | 'invitation'
  | 'generic'

export interface SendEmailInput {
  to: string
  subject: string
  html: string
  template?: EmailTemplate
}

export interface SendEmailResult {
  sent: boolean
  skipped: boolean
  id?: string
  error?: string
}

export function buildApprovalEmail(displayName: string, appUrl: string): { subject: string; html: string } {
  return {
    subject: 'Tu perfil fue aprobado en MiPage',
    html: `
      <p>Hola ${escapeHtml(displayName)},</p>
      <p>Tu perfil de proveedor fue <strong>aprobado</strong> y ya es visible públicamente.</p>
      <p><a href="${escapeHtml(appUrl)}">Ir a MiPage</a></p>
    `,
  }
}

export function buildRejectionEmail(
  displayName: string,
  reason: string,
  appUrl: string
): { subject: string; html: string } {
  return {
    subject: 'Actualización de tu perfil en MiPage',
    html: `
      <p>Hola ${escapeHtml(displayName)},</p>
      <p>Tu perfil no fue aprobado en esta revisión.</p>
      <p><strong>Motivo:</strong> ${escapeHtml(reason || 'No especificado')}</p>
      <p>Puedes actualizar tu información y volver a enviarlo desde el dashboard.</p>
      <p><a href="${escapeHtml(appUrl)}/dashboard">Ir al dashboard</a></p>
    `,
  }
}

export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export async function sendTransactionalEmail(input: SendEmailInput): Promise<SendEmailResult> {
  const apiKey = process.env.RESEND_API_KEY
  const from = process.env.EMAIL_FROM || 'MiPage <onboarding@resend.dev>'

  if (!apiKey) {
    console.info('[email] skipped (no RESEND_API_KEY)', { to: input.to, subject: input.subject })
    return { sent: false, skipped: true }
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: [input.to],
        subject: input.subject,
        html: input.html,
      }),
    })

    if (!res.ok) {
      const text = await res.text()
      return { sent: false, skipped: false, error: text }
    }

    const data = (await res.json()) as { id?: string }
    return { sent: true, skipped: false, id: data.id }
  } catch (e) {
    return { sent: false, skipped: false, error: e instanceof Error ? e.message : 'unknown' }
  }
}
