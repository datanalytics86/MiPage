const { TempPrismaClient } = require('../utils/tempDB');
const { sendEmail, generateToken: generateRandomToken } = require('../utils/emailService');

const prisma = new TempPrismaClient();

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
const PASSWORD_RESET_WINDOW_MS = 1000 * 60 * 60;

const sanitizeUser = (user) => {
  if (!user) return null;
  const { password, ...rest } = user;
  return rest;
};

exports.listUsers = async (req, res) => {
  try {
    const {
      search,
      role,
      status,
      emailConfirmed,
      page = 1,
      limit = 20,
    } = req.query;

    const where = {};
    if (role) where.role = role.toUpperCase();
    if (status === 'active') where.isActive = true;
    if (status === 'inactive') where.isActive = false;
    if (emailConfirmed === 'true') where.emailConfirmed = true;
    if (emailConfirmed === 'false') where.emailConfirmed = false;
    if (search) where.search = search;

    const take = Number.parseInt(limit, 10) || 20;
    const skip = (Number.parseInt(page, 10) - 1) * take;

    const [users, total] = await Promise.all([
      prisma.user.findMany({ where, orderBy: { createdAt: 'desc' }, skip, take }),
      prisma.user.count({ where }),
    ]);

    res.json({
      data: users.map(sanitizeUser),
      pagination: {
        total,
        page: Number.parseInt(page, 10) || 1,
        limit: take,
        totalPages: Math.ceil(total / take) || 1,
      },
    });
  } catch (error) {
    console.error('Error listando usuarios:', error);
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
};

exports.getUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    res.json({ data: sanitizeUser(user) });
  } catch (error) {
    console.error('Error obteniendo usuario:', error);
    res.status(500).json({ error: 'Error al obtener usuario' });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, phone, role, isActive, emailConfirmed } = req.body;

    const updates = {};
    if (name !== undefined) updates.name = name;
    if (phone !== undefined) updates.phone = phone;
    if (role) updates.role = role.toUpperCase();
    if (isActive !== undefined) updates.isActive = Boolean(isActive);
    if (emailConfirmed !== undefined) {
      updates.emailConfirmed = Boolean(emailConfirmed);
      updates.isVerified = Boolean(emailConfirmed);
    }

    const updated = await prisma.user.update({
      where: { id },
      data: updates,
    });

    res.json({ message: 'Usuario actualizado', data: sanitizeUser(updated) });
  } catch (error) {
    console.error('Error actualizando usuario:', error);
    res.status(500).json({ error: 'Error al actualizar usuario' });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.user.delete({ where: { id } });
    res.json({ message: 'Usuario eliminado' });
  } catch (error) {
    console.error('Error eliminando usuario:', error);
    res.status(500).json({ error: 'Error al eliminar usuario' });
  }
};

exports.triggerPasswordReset = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const token = generateRandomToken(24);
    const expiresAt = new Date(Date.now() + PASSWORD_RESET_WINDOW_MS).toISOString();

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: token,
        passwordResetTokenExpiresAt: expiresAt,
      },
    });

    const resetUrl = `${FRONTEND_URL}/auth/reset-password?token=${token}`;

    await sendEmail({
      userId: user.id,
      to: user.email,
      subject: 'Restablece tu contraseña',
      emailType: 'password_reset',
      html: `<p>Hola ${user.name || ''},</p><p>El administrador solicitó un reinicio de contraseña. Usa el siguiente botón:</p><p><a href="${resetUrl}" style="display:inline-block;padding:10px 16px;background:#111;color:#fff;text-decoration:none;border-radius:6px;">Restablecer contraseña</a></p>`,
      text: `Restablece tu contraseña visitando: ${resetUrl}`,
    });

    res.json({ message: 'Instrucciones enviadas.' });
  } catch (error) {
    console.error('Error enviando reset admin:', error);
    res.status(500).json({ error: 'Error al enviar restablecimiento' });
  }
};

exports.listEmailLogs = async (req, res) => {
  try {
    const { emailType, status, page = 1, limit = 25 } = req.query;
    const where = {};
    if (emailType) where.emailType = emailType;
    if (status) where.status = status;

    const take = Number.parseInt(limit, 10) || 25;
    const skip = (Number.parseInt(page, 10) - 1) * take;

    const [logs, total] = await Promise.all([
      prisma.emailLog.findMany({ where, orderBy: { sentAt: 'desc' }, skip, take }),
      prisma.emailLog.findMany({ where }),
    ]);

    res.json({
      data: logs,
      pagination: {
        total: total.length,
        page: Number.parseInt(page, 10) || 1,
        limit: take,
        totalPages: Math.ceil(total.length / take) || 1,
      },
    });
  } catch (error) {
    console.error('Error listando emails:', error);
    res.status(500).json({ error: 'Error al listar emails' });
  }
};

exports.resendEmail = async (req, res) => {
  try {
    const { id } = req.params;
    const log = await prisma.emailLog.findUnique({ where: { id } });
    if (!log) {
      return res.status(404).json({ error: 'Registro de email no encontrado' });
    }

    const { userId, recipientEmail, subject, body, emailType } = log;

    await sendEmail({
      userId,
      to: recipientEmail,
      subject: subject || 'Mensaje MiWeb',
      emailType: emailType || 'manual_resend',
      html: body,
      text: body,
    });

    res.json({ message: 'Email reenviado correctamente.' });
  } catch (error) {
    console.error('Error reenviando email:', error);
    res.status(500).json({ error: 'Error al reenviar email' });
  }
};
