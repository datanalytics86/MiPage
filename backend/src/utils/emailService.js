const sgMail = require('@sendgrid/mail');
const crypto = require('crypto');
const { TempPrismaClient } = require('./tempDB');

const prisma = new TempPrismaClient();

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
if (SENDGRID_API_KEY) {
  sgMail.setApiKey(SENDGRID_API_KEY);
}

const buildLogPayload = ({ userId, to, subject, body, emailType }) => ({
  userId: userId || null,
  recipientEmail: to,
  emailType,
  subject,
  body,
  status: 'pending',
  errorMessage: null,
});

const sendEmail = async ({ userId, to, subject, html, text, emailType }) => {
  const logPayload = buildLogPayload({
    userId,
    to,
    subject,
    body: html || text,
    emailType,
  });

  const log = await prisma.emailLog.create({ data: logPayload });

  if (!SENDGRID_API_KEY) {
    console.info('📧 Email (mocked send)', { to, subject, emailType });
    await prisma.emailLog.update({
      where: { id: log.id },
      data: {
        status: 'sent',
        sentAt: new Date().toISOString(),
      },
    });
    return log;
  }

  try {
    await sgMail.send({
      to,
      from: process.env.SENDGRID_FROM_EMAIL || 'no-reply@mipage.cl',
      subject,
      html,
      text,
    });

    await prisma.emailLog.update({
      where: { id: log.id },
      data: {
        status: 'sent',
        sentAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Error enviando email:', error);
    await prisma.emailLog.update({
      where: { id: log.id },
      data: {
        status: 'failed',
        errorMessage: error.message,
      },
    });
  }

  return log;
};

const generateToken = (size = 32) => crypto.randomBytes(size).toString('hex');

module.exports = {
  sendEmail,
  generateToken,
};
