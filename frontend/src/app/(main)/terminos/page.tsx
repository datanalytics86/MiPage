import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Términos de Servicio - LuxeServices',
  description: 'Términos y condiciones de uso de la plataforma LuxeServices',
}

export default function TerminosPage() {
  return (
    <div className="container-luxury py-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="font-display text-4xl font-semibold text-foreground mb-8">
          Términos de Servicio
        </h1>

        <div className="prose prose-lg text-foreground-secondary">
          <p className="text-lg text-foreground-muted mb-8">
            Última actualización: Enero 2025
          </p>

          <section className="mb-8">
            <h2 className="font-display text-2xl font-semibold text-foreground mb-4">
              1. Aceptación de los Términos
            </h2>
            <p>
              Al acceder y utilizar LuxeServices, aceptas estar sujeto a estos términos de servicio.
              Si no estás de acuerdo con alguna parte de estos términos, no podrás acceder al servicio.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-display text-2xl font-semibold text-foreground mb-4">
              2. Descripción del Servicio
            </h2>
            <p>
              LuxeServices es una plataforma que conecta a usuarios con proveedores de servicios
              profesionales en las categorías de masajes terapéuticos, modelaje y servicios relacionados.
              Actuamos únicamente como intermediarios y no somos responsables de los servicios
              prestados por los proveedores.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-display text-2xl font-semibold text-foreground mb-4">
              3. Registro de Cuenta
            </h2>
            <p>Para utilizar ciertas funciones de la plataforma, deberás crear una cuenta. Te comprometes a:</p>
            <ul className="list-disc pl-6 mt-4 space-y-2">
              <li>Proporcionar información veraz y actualizada</li>
              <li>Mantener la seguridad de tu cuenta y contraseña</li>
              <li>Notificarnos inmediatamente de cualquier uso no autorizado</li>
              <li>Ser mayor de 18 años de edad</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="font-display text-2xl font-semibold text-foreground mb-4">
              4. Proveedores de Servicios
            </h2>
            <p>Los proveedores que se registren en la plataforma deben:</p>
            <ul className="list-disc pl-6 mt-4 space-y-2">
              <li>Cumplir con todas las leyes y regulaciones aplicables</li>
              <li>Proporcionar información precisa sobre sus servicios y precios</li>
              <li>Mantener los estándares de calidad profesional</li>
              <li>Respetar la privacidad de los clientes</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="font-display text-2xl font-semibold text-foreground mb-4">
              5. Contenido del Usuario
            </h2>
            <p>
              Al publicar contenido en la plataforma, garantizas que tienes los derechos necesarios
              sobre dicho contenido y nos otorgas una licencia para usarlo en relación con nuestros servicios.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-display text-2xl font-semibold text-foreground mb-4">
              6. Conducta Prohibida
            </h2>
            <p>Está prohibido:</p>
            <ul className="list-disc pl-6 mt-4 space-y-2">
              <li>Publicar contenido ilegal, ofensivo o que infrinja derechos de terceros</li>
              <li>Utilizar la plataforma para actividades fraudulentas</li>
              <li>Acosar a otros usuarios o proveedores</li>
              <li>Intentar acceder a cuentas de otros usuarios</li>
              <li>Publicar información falsa o engañosa</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="font-display text-2xl font-semibold text-foreground mb-4">
              7. Limitación de Responsabilidad
            </h2>
            <p>
              LuxeServices no será responsable por daños indirectos, incidentales, especiales o
              consecuentes que resulten del uso o la imposibilidad de uso de nuestros servicios.
              No garantizamos la calidad de los servicios proporcionados por los proveedores.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-display text-2xl font-semibold text-foreground mb-4">
              8. Modificaciones
            </h2>
            <p>
              Nos reservamos el derecho de modificar estos términos en cualquier momento.
              Los cambios entrarán en vigor inmediatamente después de su publicación.
              El uso continuado de la plataforma constituye la aceptación de los términos modificados.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-display text-2xl font-semibold text-foreground mb-4">
              9. Contacto
            </h2>
            <p>
              Si tienes preguntas sobre estos términos, contáctanos en:{' '}
              <a href="mailto:legal@luxeservices.com" className="text-gold hover:underline">
                legal@luxeservices.com
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
