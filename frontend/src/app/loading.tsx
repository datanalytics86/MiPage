export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        {/* Spinner */}
        <div className="relative w-16 h-16 mx-auto mb-6">
          <div className="absolute inset-0 border-4 border-muted rounded-full"></div>
          <div className="absolute inset-0 border-4 border-gold border-t-transparent rounded-full animate-spin"></div>
        </div>

        {/* Brand */}
        <p className="font-display text-xl font-semibold text-foreground">
          Mi<span className="text-gold">Page</span>
        </p>
        <p className="text-sm text-foreground-muted mt-2">
          Cargando...
        </p>
      </div>
    </div>
  )
}
