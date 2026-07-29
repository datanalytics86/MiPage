import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Política de Privacidad',
  description: 'Política de privacidad y protección de datos de MiPage',
}

export default function PrivacidadPage() {
  return (
    <div className="container-luxury py-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="font-display text-4xl font-semibold text-foreground mb-8">
          Política de Privacidad
        </h1>

        <div className="prose prose-lg text-foreground-secondary">
          <p className="text-lg text-foreground-muted mb-8">
            Última actualización: Enero 2025
          </p>

          <section className="mb-8">
            <h2 className="font-display text-2xl font-semibold text-foreground mb-4">
              1. Información que Recopilamos
            </h2>
            <p>Recopilamos información que nos proporcionas directamente, incluyendo:</p>
            <ul className="list-disc pl-6 mt-4 space-y-2">
              <li>Nombre y datos de contacto</li>
              <li>Correo electrónico y número de teléfono</li>
              <li>Información de perfil y fotografías</li>
              <li>Información de ubicación (ciudad)</li>
              <li>Historial de interacciones en la plataforma</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="font-display text-2xl font-semibold text-foreground mb-4">
              2. Uso de la Información
            </h2>
            <p>Utilizamos tu información para:</p>
            <ul className="list-disc pl-6 mt-4 space-y-2">
              <li>Proporcionar y mejorar nuestros servicios</li>
              <li>Procesar transacciones y enviar notificaciones relacionadas</li>
              <li>Personalizar tu experiencia en la plataforma</li>
              <li>Comunicarnos contigo sobre actualizaciones y promociones</li>
              <li>Prevenir actividades fraudulentas</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="font-display text-2xl font-semibold text-foreground mb-4">
              3. Compartir Información
            </h2>
            <p>
              No vendemos tu información personal. Compartimos información solo en las siguientes circunstancias:
            </p>
            <ul className="list-disc pl-6 mt-4 space-y-2">
              <li>Con proveedores de servicios que nos ayudan a operar la plataforma</li>
              <li>Cuando sea requerido por ley</li>
              <li>Para proteger nuestros derechos y seguridad</li>
              <li>Con tu consentimiento explícito</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="font-display text-2xl font-semibold text-foreground mb-4">
              4. Seguridad de Datos
            </h2>
            <p>
              Implementamos medidas de seguridad técnicas y organizativas para proteger tu información
              personal contra acceso no autorizado, alteración, divulgación o destrucción.
              Utilizamos encriptación SSL/TLS para todas las transmisiones de datos.
            </p>
          </section>

          <section id="derechos" className="mb-8">
            <h2 className="font-display text-2xl font-semibold text-foreground mb-4">
              5. Tus Derechos (Ley 19.628)
            </h2>
            <p>
              Conforme a la legislación chilena sobre protección de la vida privada, tienes derecho a:
            </p>
            <ul className="list-disc pl-6 mt-4 space-y-2">
              <li>Acceder a tu información personal</li>
              <li>Corregir datos inexactos</li>
              <li>Solicitar la eliminación de tus datos</li>
              <li>Oponerte al procesamiento de tus datos</li>
              <li>Portabilidad de datos</li>
            </ul>
            <p className="mt-4">
              Para solicitar eliminación de cuenta y datos, inicia sesión y envía un POST autenticado a{' '}
              <code className="text-sm bg-muted px-1 rounded">/api/account/delete-request</code>{' '}
              o escribe a privacidad@mipage.cl. Las solicitudes se procesan manualmente por el administrador.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-display text-2xl font-semibold text-foreground mb-4">
              6. Cookies
            </h2>
            <p>
              Utilizamos cookies y tecnologías similares para mejorar tu experiencia,
              analizar el tráfico y personalizar el contenido. Puedes configurar tu navegador
              para rechazar cookies, aunque esto puede afectar la funcionalidad de la plataforma.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-display text-2xl font-semibold text-foreground mb-4">
              7. Retención de Datos
            </h2>
            <p>
              Conservamos tu información personal mientras tu cuenta esté activa o según sea
              necesario para proporcionarte servicios. Puedes solicitar la eliminación de tu
              cuenta en cualquier momento.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-display text-2xl font-semibold text-foreground mb-4">
              8. Menores de Edad
            </h2>
            <p>
              Nuestros servicios están destinados a personas mayores de 18 años.
              No recopilamos intencionalmente información de menores de edad.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-display text-2xl font-semibold text-foreground mb-4">
              9. Contacto
            </h2>
            <p>
              Para ejercer tus derechos o consultas sobre privacidad, contáctanos en:{' '}
              <a href="mailto:privacidad@mipage.cl" className="text-gold hover:underline">
                privacidad@mipage.cl
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
