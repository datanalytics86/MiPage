import type { EmailTemplate } from '@/lib/email'
import { sendTransactionalEmail } from '@/lib/email'
import { createServiceRoleClient } from '@/lib/supabase/admin'

export async function recordNotification(input: {
  userId?: string | null
  email: string | null
  template: string
  payload?: Record<string, unknown>
  status: 'sent' | 'skipped' | 'failed'
  error?: string | null
}): Promise<void> {
  const admin = createServiceRoleClient()
  if (!admin) return
  await admin.from('notification_log').insert({
    user_id: input.userId ?? null,
    email: input.email,
    template: input.template,
    payload: input.payload ?? {},
    status: input.status,
    error: input.error ?? null,
  })
}

export async function recordAudit(input: {
  actorId: string
  action: string
  targetType: string
  targetId: string
  before?: Record<string, unknown> | null
  after?: Record<string, unknown> | null
}): Promise<void> {
  const admin = createServiceRoleClient()
  if (!admin) return
  await admin.from('admin_audit_log').insert({
    actor_id: input.actorId,
    action: input.action,
    target_type: input.targetType,
    target_id: input.targetId,
    before: input.before ?? null,
    after: input.after ?? null,
  })
}

export async function sendAndLog(input: {
  to: string | null | undefined
  subject: string
  html: string
  template: EmailTemplate
  userId?: string | null
  payload?: Record<string, unknown>
}): Promise<{ sent: boolean; skipped: boolean; error?: string }> {
  if (!input.to) {
    await recordNotification({
      userId: input.userId,
      email: null,
      template: input.template,
      payload: input.payload,
      status: 'skipped',
      error: 'no_email',
    })
    return { sent: false, skipped: true }
  }

  const result = await sendTransactionalEmail({
    to: input.to,
    subject: input.subject,
    html: input.html,
    template: input.template,
  })

  await recordNotification({
    userId: input.userId,
    email: input.to,
    template: input.template,
    payload: { ...(input.payload ?? {}), subject: input.subject, html: input.html },
    status: result.sent ? 'sent' : result.skipped ? 'skipped' : 'failed',
    error: result.error ?? null,
  })

  return result
}
