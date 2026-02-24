const sgMail = require('@sendgrid/mail');

const getEmailConfig = () => {
  const apiKey = process.env.SENDGRID_API_KEY;
  const from = process.env.SENDGRID_FROM_EMAIL;

  if (!apiKey || !from) {
    return null;
  }

  sgMail.setApiKey(apiKey);
  return { from };
};

const sendInvitationEmail = async ({ to, name, registrationLink }) => {
  const config = getEmailConfig();

  if (!config) {
    return {
      status: 'skipped',
      reason: 'SENDGRID_API_KEY / SENDGRID_FROM_EMAIL no configurados',
    };
  }

  const safeName = name || 'Hola';

  await sgMail.send({
    to,
    from: config.from,
    subject: 'Invitación para completar tu registro en MiPage',
    text: `${safeName}, completa tu registro aquí: ${registrationLink}`,
    html: `
      <p>${safeName},</p>
      <p>Tu perfil fue aprobado. Completa tu registro para activar tu cuenta:</p>
      <p><a href="${registrationLink}">${registrationLink}</a></p>
      <p>Este enlace expira en 7 días.</p>
    `,
  });

  return { status: 'sent' };
};

module.exports = {
  sendInvitationEmail,
};
