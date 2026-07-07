import React from 'react'
import Link from 'next/link'
import { Instagram, Mail, MapPin } from 'lucide-react'
import { siteConfig } from '@/lib/site'

export function Footer() {
  return (
    <footer className="bg-background-dark text-white">
      <div className="container-luxury py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="inline-block">
              <span className="font-display text-2xl font-semibold">
                {siteConfig.name.slice(0, 2)}
                <span className="text-gold">{siteConfig.name.slice(2)}</span>
              </span>
            </Link>
            <p className="text-white/60 text-sm leading-relaxed">
              La plataforma premium para descubrir servicios profesionales de masajes y modelaje en Chile.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-display text-lg font-semibold mb-4">Explorar</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/explorar/masajes" className="text-white/60 hover:text-gold transition-colors text-sm">
                  Masajes Terapéuticos
                </Link>
              </li>
              <li>
                <Link href="/explorar/modelaje" className="text-white/60 hover:text-gold transition-colors text-sm">
                  Modelaje
                </Link>
              </li>
              <li>
                <Link href="/explorar" className="text-white/60 hover:text-gold transition-colors text-sm">
                  Ver todos
                </Link>
              </li>
            </ul>
          </div>

          {/* Para Profesionales */}
          <div>
            <h4 className="font-display text-lg font-semibold mb-4">Profesionales</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/register?type=provider" className="text-white/60 hover:text-gold transition-colors text-sm">
                  Únete como profesional
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="text-white/60 hover:text-gold transition-colors text-sm">
                  Panel de control
                </Link>
              </li>
              <li>
                <Link href="/ayuda" className="text-white/60 hover:text-gold transition-colors text-sm">
                  Centro de ayuda
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-display text-lg font-semibold mb-4">Legal</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/terminos" className="text-white/60 hover:text-gold transition-colors text-sm">
                  Términos de servicio
                </Link>
              </li>
              <li>
                <Link href="/privacidad" className="text-white/60 hover:text-gold transition-colors text-sm">
                  Política de privacidad
                </Link>
              </li>
              <li>
                <Link href="/contacto" className="text-white/60 hover:text-gold transition-colors text-sm">
                  Contacto
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-white/10 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-white/40 text-sm">
            © {new Date().getFullYear()} {siteConfig.name}. Todos los derechos reservados.
          </p>
          <div className="flex items-center space-x-4">
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/40 hover:text-gold transition-colors"
            >
              <Instagram className="h-5 w-5" />
            </a>
            <a
              href={`mailto:${siteConfig.emails.contact}`}
              className="text-white/40 hover:text-gold transition-colors"
            >
              <Mail className="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
