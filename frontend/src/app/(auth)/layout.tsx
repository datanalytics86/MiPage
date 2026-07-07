import Link from 'next/link'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Simple Header */}
      <header className="py-6 px-4">
        <div className="container-luxury">
          <Link href="/" className="inline-block">
            <span className="font-display text-2xl font-semibold text-foreground">
              Mi<span className="text-gold">Page</span>
            </span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        {children}
      </main>

      {/* Simple Footer */}
      <footer className="py-6 px-4 text-center text-foreground-muted text-sm">
        © {new Date().getFullYear()} MiPage. Todos los derechos reservados.
      </footer>
    </div>
  )
}
