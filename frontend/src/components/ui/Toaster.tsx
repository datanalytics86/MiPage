'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react'
import { useUIStore } from '@/stores/uiStore'
import { cn } from '@/lib/utils'

const icons = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
}

const colors = {
  success: 'border-success/30 text-success',
  error: 'border-error/30 text-error',
  warning: 'border-warning/30 text-warning',
  info: 'border-gold/30 text-gold',
}

export function Toaster() {
  const { toasts, removeToast } = useUIStore()

  return (
    <div
      className="fixed bottom-4 right-4 z-[90] flex flex-col gap-2 max-w-sm w-[calc(100%-2rem)] sm:w-full pointer-events-none safe-pb"
      aria-live="polite"
    >
      <AnimatePresence>
        {toasts.map((toast) => {
          const Icon = icons[toast.type]

          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.96 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className={cn(
                'pointer-events-auto flex items-start gap-3 p-4 rounded-2xl border shadow-soft-lg',
                'glass-strong',
                colors[toast.type]
              )}
            >
              <Icon className="h-5 w-5 shrink-0 mt-0.5" aria-hidden />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground">{toast.title}</p>
                {toast.message && (
                  <p className="text-sm text-foreground-secondary mt-1">
                    {toast.message}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => removeToast(toast.id)}
                className="shrink-0 p-1.5 rounded-full hover:bg-white/10 transition-colors"
                aria-label="Cerrar notificación"
              >
                <X className="h-4 w-4 text-foreground-muted" />
              </button>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
