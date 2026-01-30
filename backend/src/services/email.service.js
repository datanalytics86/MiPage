/**
 * Email Service
 * Servicio para envío de emails usando Resend o SMTP
 *
 * Configurar variables de entorno:
 * - EMAIL_PROVIDER: 'resend' | 'smtp' | 'console' (default: console para desarrollo)
 * - RESEND_API_KEY: API key de Resend
 * - SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS: Para SMTP
 * - EMAIL_FROM: Email remitente (default: noreply@mipage.cl)
 */

const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.provider = process.env.EMAIL_PROVIDER || 'console';
    this.from = process.env.EMAIL_FROM || 'LuxeServices <noreply@luxeservices.cl>';
    this.frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

    this.initializeTransporter();
  }

  initializeTransporter() {
    switch (this.provider) {
      case 'resend':
        // Resend usa SMTP compatible
        this.transporter = nodemailer.createTransport({
          host: 'smtp.resend.com',
          port: 465,
          secure: true,
          auth: {
            user: 'resend',
            pass: process.env.RESEND_API_KEY,
          },
        });
        break;

      case 'smtp':
        this.transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: parseInt(process.env.SMTP_PORT || '587'),
          secure: process.env.SMTP_SECURE === 'true',
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
        });
        break;

      case 'console':
      default:
        // En desarrollo, solo loguear
        this.transporter = null;
        break;
    }
  }

  /**
   * Envía un email
   * @param {Object} options - Opciones del email
   * @param {string} options.to - Destinatario
   * @param {string} options.subject - Asunto
   * @param {string} options.html - Contenido HTML
   * @param {string} [options.text] - Contenido texto plano
   */
  async send({ to, subject, html, text }) {
    const mailOptions = {
      from: this.from,
      to,
      subject,
      html,
      text: text || this.htmlToText(html),
    };

    if (this.provider === 'console') {
      console.log('📧 [EMAIL SERVICE - CONSOLE MODE]');
      console.log('To:', to);
      console.log('Subject:', subject);
      console.log('---');
      return { success: true, messageId: `console-${Date.now()}` };
    }

    try {
      const result = await this.transporter.sendMail(mailOptions);
      console.log('📧 Email enviado:', result.messageId);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('❌ Error enviando email:', error);
      throw error;
    }
  }

  /**
   * Convierte HTML básico a texto plano
   */
  htmlToText(html) {
    return html
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/p>/gi, '\n\n')
      .replace(/<[^>]+>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .trim();
  }

  /**
   * Template base para emails
   */
  getBaseTemplate(content) {
    return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>LuxeServices</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
      line-height: 1.6;
      color: #1a1a2e;
      background-color: #f5f5f5;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .card {
      background: #ffffff;
      border-radius: 12px;
      padding: 40px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    .logo {
      text-align: center;
      margin-bottom: 30px;
    }
    .logo h1 {
      color: #c9a959;
      font-size: 28px;
      margin: 0;
    }
    .content {
      margin-bottom: 30px;
    }
    .button {
      display: inline-block;
      background: linear-gradient(135deg, #c9a959 0%, #d4af37 100%);
      color: #ffffff !important;
      text-decoration: none;
      padding: 14px 28px;
      border-radius: 8px;
      font-weight: 600;
      text-align: center;
    }
    .button:hover {
      opacity: 0.9;
    }
    .footer {
      text-align: center;
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #e5e5e5;
      color: #666;
      font-size: 14px;
    }
    .highlight {
      background: #fef3c7;
      padding: 16px;
      border-radius: 8px;
      border-left: 4px solid #c9a959;
      margin: 20px 0;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      <div class="logo">
        <h1>✨ LuxeServices</h1>
      </div>
      <div class="content">
        ${content}
      </div>
      <div class="footer">
        <p>Este email fue enviado por LuxeServices</p>
        <p>Si no solicitaste este email, puedes ignorarlo.</p>
      </div>
    </div>
  </div>
</body>
</html>
    `;
  }

  /**
   * Envía email de invitación para registro
   */
  async sendInvitation({ to, name, registrationLink, invitedBy }) {
    const content = `
      <h2>¡Hola${name ? ` ${name}` : ''}!</h2>
      <p>Has sido invitado/a a unirte a <strong>LuxeServices</strong>, la plataforma premium de servicios profesionales en Chile.</p>

      <div class="highlight">
        <p><strong>¿Qué es LuxeServices?</strong></p>
        <p>Una plataforma donde profesionales de masajes y modelaje pueden ofrecer sus servicios de manera segura y profesional.</p>
      </div>

      <p>Para completar tu registro y crear tu perfil profesional, haz clic en el siguiente botón:</p>

      <p style="text-align: center; margin: 30px 0;">
        <a href="${registrationLink}" class="button">Completar mi Registro</a>
      </p>

      <p style="font-size: 14px; color: #666;">
        Este enlace expira en <strong>7 días</strong>. Si el botón no funciona, copia y pega este enlace en tu navegador:<br>
        <a href="${registrationLink}" style="color: #c9a959; word-break: break-all;">${registrationLink}</a>
      </p>

      ${invitedBy ? `<p style="font-size: 14px; color: #666;">Invitado por: ${invitedBy}</p>` : ''}
    `;

    return this.send({
      to,
      subject: '✨ Invitación a LuxeServices - Completa tu registro',
      html: this.getBaseTemplate(content),
    });
  }

  /**
   * Envía email de bienvenida después del registro
   */
  async sendWelcome({ to, name }) {
    const content = `
      <h2>¡Bienvenido/a a LuxeServices, ${name}! 🎉</h2>
      <p>Tu cuenta ha sido creada exitosamente. Ahora puedes empezar a configurar tu perfil profesional.</p>

      <div class="highlight">
        <p><strong>Próximos pasos:</strong></p>
        <ul style="margin: 10px 0; padding-left: 20px;">
          <li>Completa tu perfil con fotos profesionales</li>
          <li>Añade tus servicios y precios</li>
          <li>Configura tu disponibilidad</li>
        </ul>
      </div>

      <p style="text-align: center; margin: 30px 0;">
        <a href="${this.frontendUrl}/publisher/dashboard" class="button">Ir a mi Dashboard</a>
      </p>

      <p>Si tienes alguna pregunta, no dudes en contactarnos.</p>
    `;

    return this.send({
      to,
      subject: '🎉 Bienvenido/a a LuxeServices',
      html: this.getBaseTemplate(content),
    });
  }

  /**
   * Envía notificación de nueva reserva
   */
  async sendBookingNotification({ to, providerName, serviceName, clientName, date }) {
    const content = `
      <h2>Nueva solicitud de reserva 📅</h2>
      <p>Hola ${providerName}, tienes una nueva solicitud de reserva:</p>

      <div class="highlight">
        <p><strong>Detalles:</strong></p>
        <ul style="margin: 10px 0; padding-left: 20px;">
          <li><strong>Servicio:</strong> ${serviceName}</li>
          <li><strong>Cliente:</strong> ${clientName}</li>
          ${date ? `<li><strong>Fecha:</strong> ${date}</li>` : ''}
        </ul>
      </div>

      <p style="text-align: center; margin: 30px 0;">
        <a href="${this.frontendUrl}/publisher/reservas" class="button">Ver Reservas</a>
      </p>
    `;

    return this.send({
      to,
      subject: `📅 Nueva reserva - ${serviceName}`,
      html: this.getBaseTemplate(content),
    });
  }

  /**
   * Envía notificación de nueva reseña
   */
  async sendReviewNotification({ to, providerName, rating, reviewerName }) {
    const stars = '⭐'.repeat(rating);
    const content = `
      <h2>Nueva reseña recibida ${stars}</h2>
      <p>Hola ${providerName}, has recibido una nueva reseña de <strong>${reviewerName}</strong>.</p>

      <div class="highlight">
        <p><strong>Calificación:</strong> ${rating}/5 ${stars}</p>
      </div>

      <p style="text-align: center; margin: 30px 0;">
        <a href="${this.frontendUrl}/publisher/resenas" class="button">Ver Reseña</a>
      </p>

      <p>Recuerda que responder a las reseñas ayuda a construir confianza con tus clientes.</p>
    `;

    return this.send({
      to,
      subject: `⭐ Nueva reseña: ${rating}/5 estrellas`,
      html: this.getBaseTemplate(content),
    });
  }

  /**
   * Envía email de recuperación de contraseña
   */
  async sendPasswordReset({ to, name, resetLink }) {
    const content = `
      <h2>Recuperación de contraseña</h2>
      <p>Hola${name ? ` ${name}` : ''}, recibimos una solicitud para restablecer tu contraseña.</p>

      <p style="text-align: center; margin: 30px 0;">
        <a href="${resetLink}" class="button">Restablecer Contraseña</a>
      </p>

      <p style="font-size: 14px; color: #666;">
        Este enlace expira en <strong>1 hora</strong>. Si no solicitaste este cambio, puedes ignorar este email.
      </p>
    `;

    return this.send({
      to,
      subject: '🔐 Recupera tu contraseña - LuxeServices',
      html: this.getBaseTemplate(content),
    });
  }
}

// Exportar instancia singleton
const emailService = new EmailService();

module.exports = { emailService, EmailService };
