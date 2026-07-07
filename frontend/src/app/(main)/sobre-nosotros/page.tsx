import { Metadata } from 'next'
import Link from 'next/link'
import { Shield, Heart, Star, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export const metadata: Metadata = {
  title: 'Sobre Nosotros',
  description: 'Conoce más sobre MiPage, el marketplace de servicios profesionales en Chile',
}

const values = [
  {
    icon: Shield,
    title: 'Confianza y Seguridad',
    description: 'Verificamos a todos nuestros proveedores para garantizar la mejor experiencia.',
  },
  {
    icon: Star,
    title: 'Calidad Premium',
    description: 'Solo trabajamos con profesionales que cumplen con los más altos estándares.',
  },
  {
    icon: Heart,
    title: 'Atención Personalizada',
    description: 'Cada cliente es único y merece una experiencia adaptada a sus necesidades.',
  },
  {
    icon: Users,
    title: 'Comunidad',
    description: 'Creamos conexiones significativas entre clientes y profesionales.',
  },
]

const stats = [
  { value: '500+', label: 'Profesionales verificados' },
  { value: '10,000+', label: 'Clientes satisfechos' },
  { value: '4.9', label: 'Calificación promedio' },
  { value: '50+', label: 'Ciudades en Chile' },
]

export default function SobreNosotrosPage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-b from-gold/5 to-transparent">
        <div className="container-luxury">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="font-display text-4xl md:text-5xl font-semibold text-foreground mb-6">
              Conectando talentos con quienes los buscan
            </h1>
            <p className="text-xl text-foreground-secondary">
              LuxeServices nació con la misión de crear un espacio premium donde
              profesionales talentosos puedan mostrar su trabajo y conectar con
              clientes que valoran la calidad.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 border-b border-border">
        <div className="container-luxury">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="font-display text-4xl font-semibold text-gold mb-2">
                  {stat.value}
                </div>
                <div className="text-foreground-secondary">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-16">
        <div className="container-luxury">
          <div className="max-w-3xl mx-auto">
            <h2 className="font-display text-3xl font-semibold text-foreground mb-6 text-center">
              Nuestra Historia
            </h2>
            <div className="space-y-6 text-foreground-secondary text-lg">
              <p>
                LuxeServices comenzó en 2024 con una idea simple: crear una plataforma
                donde los profesionales de servicios de bienestar y modelaje pudieran
                destacar su trabajo de manera elegante y profesional.
              </p>
              <p>
                Notamos que existía una brecha entre profesionales talentosos y clientes
                que buscaban servicios de calidad. Las plataformas existentes no ofrecían
                la experiencia premium que ambos merecían.
              </p>
              <p>
                Hoy, LuxeServices es la plataforma líder en Chile para conectar con
                profesionales verificados en masajes terapéuticos, modelaje y servicios
                relacionados. Cada perfil es cuidadosamente revisado para garantizar
                autenticidad y calidad.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 bg-muted/30">
        <div className="container-luxury">
          <h2 className="font-display text-3xl font-semibold text-foreground mb-12 text-center">
            Nuestros Valores
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value) => (
              <Card key={value.title} className="text-center">
                <CardContent className="pt-8 pb-6">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gold/10 flex items-center justify-center">
                    <value.icon className="h-8 w-8 text-gold" />
                  </div>
                  <h3 className="font-display text-xl font-semibold text-foreground mb-2">
                    {value.title}
                  </h3>
                  <p className="text-foreground-secondary">
                    {value.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container-luxury">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="font-display text-3xl font-semibold text-foreground mb-6">
              ¿Listo para comenzar?
            </h2>
            <p className="text-lg text-foreground-secondary mb-8">
              Ya sea que busques servicios profesionales o quieras ofrecer los tuyos,
              LuxeServices es el lugar perfecto para ti.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/explorar">
                <Button size="lg">
                  Explorar servicios
                </Button>
              </Link>
              <Link href="/register?role=provider">
                <Button size="lg" variant="outline">
                  Unirte como profesional
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
