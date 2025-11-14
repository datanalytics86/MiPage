// Temporal: Usar JSON en lugar de Prisma por problemas de binarios
const { TempPrismaClient } = require('../utils/tempDB');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const { sendEmail, generateToken: generateRandomToken } = require('../utils/emailService');

const prisma = new TempPrismaClient();

/**
 * Generar JWT token
 */
const generateJwtToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
const EMAIL_CONFIRMATION_WINDOW_MS = 1000 * 60 * 60 * 24; // 24 horas
const PASSWORD_RESET_WINDOW_MS = 1000 * 60 * 60; // 1 hora
const SESSION_DURATION_MS = Number.parseInt(process.env.JWT_SESSION_DURATION_MS || '', 10) || 1000 * 60 * 60 * 12;

/**
 * Registro de nuevo usuario
 */
const register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, name, role, phone, acceptTerms } = req.body;
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedRole = (role || '').toUpperCase();

    if (!['USER', 'PUBLISHER'].includes(normalizedRole)) {
      return res.status(400).json({
        error: 'El rol seleccionado no es válido',
      });
    }

    if (!(acceptTerms === true || acceptTerms === 'true')) {
      return res.status(400).json({
        error: 'Debes aceptar los términos y condiciones',
      });
    }

    // Verificar si el usuario ya existe
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return res.status(409).json({
        error: 'El email ya está registrado',
      });
    }

    // Hash de contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    const confirmationToken = generateRandomToken(24);
    const confirmationExpires = new Date(Date.now() + EMAIL_CONFIRMATION_WINDOW_MS).toISOString();

    // Crear usuario
    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        password: hashedPassword,
        name,
        phone,
        role: normalizedRole,
        isActive: true,
        isVerified: false,
        emailConfirmed: false,
        emailConfirmationToken: confirmationToken,
        emailConfirmationTokenExpiresAt: confirmationExpires,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phone: true,
        emailConfirmed: true,
        createdAt: true,
      },
    });

    const confirmationUrl = `${FRONTEND_URL}/auth/confirm-email?token=${confirmationToken}`;

    await sendEmail({
      userId: user.id,
      to: normalizedEmail,
      subject: 'Confirma tu cuenta en MiWeb',
      emailType: 'confirmation',
      html: `<p>Hola ${name || ''},</p>
        <p>Gracias por registrarte en MiWeb. Para activar tu cuenta haz clic en el siguiente botón:</p>
        <p><a href="${confirmationUrl}" style="display:inline-block;padding:10px 16px;background:#111;color:#fff;text-decoration:none;border-radius:6px;">Activar cuenta</a></p>
        <p>Este enlace es válido por 24 horas.</p>`,
      text: `Hola ${name || ''}, confirma tu cuenta visitando: ${confirmationUrl}`,
    });

    res.status(201).json({
      message: 'Registro exitoso. Revisa tu correo para confirmar la cuenta.',
      user,
    });
  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({
      error: 'Error al registrar usuario',
    });
  }
};

/**
 * Login de usuario
 */
const login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, role } = req.body;
    const normalizedEmail = email.trim().toLowerCase();
    const requestedRole = role ? role.toUpperCase() : null;

    // Buscar usuario
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      return res.status(401).json({
        error: 'Credenciales inválidas',
      });
    }

    if (requestedRole && requestedRole !== user.role) {
      return res.status(403).json({
        error: 'El rol seleccionado no corresponde a la cuenta',
      });
    }

    // Verificar contraseña
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        error: 'Credenciales inválidas',
      });
    }

    if (!user.emailConfirmed) {
      return res.status(403).json({
        error: 'Verifica tu email para activar la cuenta',
        requiresConfirmation: true,
      });
    }

    if (user.isActive === false) {
      return res.status(403).json({
        error: 'Tu cuenta está desactivada. Contacta al administrador.',
      });
    }

    if (user.role === 'ADMIN') {
      const expectedAdminEmail = (process.env.ADMIN_EMAIL || 'admin@mipage.cl').toLowerCase();
      if (normalizedEmail !== expectedAdminEmail) {
        return res.status(401).json({
          error: 'Credenciales inválidas',
        });
      }
    }

    // Generar token
    const token = generateJwtToken(user.id);

    // Datos del usuario (sin contraseña)
    const userData = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      avatar: user.avatar,
      isVerified: Boolean(user.emailConfirmed),
      emailConfirmed: Boolean(user.emailConfirmed),
      phone: user.phone,
      isActive: user.isActive !== false,
      lastLogin: user.lastLogin || null,
    };

    await prisma.user.update({
      where: { id: user.id },
      data: {
        lastLogin: new Date().toISOString(),
      },
    });

    res.json({
      message: 'Login exitoso',
      user: userData,
      token,
      expiresInMs: SESSION_DURATION_MS,
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({
      error: 'Error al iniciar sesión',
    });
  }
};

/**
 * Obtener perfil del usuario autenticado
 */
const getProfile = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        avatar: true,
        bio: true,
        role: true,
        isVerified: true,
        createdAt: true,
        _count: {
          select: {
            services: true,
            reviews: true,
            posts: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({
        error: 'Usuario no encontrado',
      });
    }

    res.json(user);
  } catch (error) {
    console.error('Error al obtener perfil:', error);
    res.status(500).json({
      error: 'Error al obtener perfil',
    });
  }
};

/**
 * Actualizar perfil
 */
const updateProfile = async (req, res) => {
  try {
    const { name, phone, bio, avatar } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        ...(name && { name }),
        ...(phone !== undefined && { phone }),
        ...(bio !== undefined && { bio }),
        ...(avatar && { avatar }),
      },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        avatar: true,
        bio: true,
        role: true,
        isVerified: true,
      },
    });

    res.json({
      message: 'Perfil actualizado exitosamente',
      user: updatedUser,
    });
  } catch (error) {
    console.error('Error al actualizar perfil:', error);
    res.status(500).json({
      error: 'Error al actualizar perfil',
    });
  }
};

/**
 * Cambiar contraseña
 */
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Obtener usuario con contraseña
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
    });

    // Verificar contraseña actual
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        error: 'Contraseña actual incorrecta',
      });
    }

    // Hash de nueva contraseña
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Actualizar contraseña
    await prisma.user.update({
      where: { id: req.user.id },
      data: { password: hashedPassword },
    });

    res.json({
      message: 'Contraseña cambiada exitosamente',
    });
  } catch (error) {
    console.error('Error al cambiar contraseña:', error);
    res.status(500).json({
      error: 'Error al cambiar contraseña',
    });
  }
};

/**
 * Completar registro con token de invitación
 */
const registerWithToken = async (req, res) => {
  try {
    const {
      token,
      password,
      name,
      phone,
      // Metadata fija
      rut,
      edad,
      nacionalidad,
      altura,
      peso,
      contextura,
      medidas,
      region,
      ciudad,
      comuna,
      direccion,
      tipoServicio,
      biografia,
      horarios,
      tarifas,
      // Campos custom
      customFields, // { fieldId: value, ... }
    } = req.body;

    // Validaciones básicas
    if (!token || !password || !name) {
      return res.status(400).json({
        success: false,
        error: 'Token, password y nombre son requeridos',
      });
    }

    // Buscar usuario por token
    const user = await prisma.user.findUnique({
      where: { registrationToken: token },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Token de registro inválido',
      });
    }

    // Verificar expiración
    if (user.tokenExpiresAt && new Date() > user.tokenExpiresAt) {
      return res.status(400).json({
        success: false,
        error: 'El token de registro ha expirado',
      });
    }

    // Verificar que no esté ya registrado
    if (user.approvalStatus === 'REGISTERED' ||
        user.approvalStatus === 'ACTIVE' ||
        user.approvalStatus === 'INACTIVE') {
      return res.status(400).json({
        success: false,
        error: 'Este usuario ya ha completado su registro',
      });
    }

    // Hashear password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Actualizar usuario
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        name,
        phone,
        password: hashedPassword,
        approvalStatus: 'REGISTERED',
        registrationToken: null,
        tokenExpiresAt: null,
      },
    });

    // Crear metadata
    const metadata = await prisma.userMetadata.create({
      data: {
        userId: updatedUser.id,
        rut,
        edad: edad ? parseInt(edad) : null,
        nacionalidad,
        altura: altura ? parseInt(altura) : null,
        peso: peso ? parseInt(peso) : null,
        contextura,
        medidas,
        region,
        ciudad,
        comuna,
        direccion,
        tipoServicio,
        biografia,
        horarios,
        tarifas,
      },
    });

    // Crear valores de campos custom si existen
    if (customFields && Object.keys(customFields).length > 0) {
      const customValuePromises = Object.entries(customFields).map(([fieldId, value]) =>
        prisma.customFieldValue.create({
          data: {
            metadataId: metadata.id,
            fieldId,
            value: String(value),
          },
        })
      );

      await Promise.all(customValuePromises);
    }

    // Generar JWT
    const jwtToken = generateJwtToken(updatedUser.id);

    res.status(201).json({
      success: true,
      message: 'Registro completado exitosamente',
      token: jwtToken,
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        role: updatedUser.role,
        approvalStatus: updatedUser.approvalStatus,
      },
    });
} catch (error) {
    console.error('Error in register with token:', error);
    res.status(500).json({
      success: false,
      error: 'Error al completar registro',
      message: error.message,
    });
  }
};

const confirmEmail = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ error: 'Token de confirmación requerido' });
    }

    const user = await prisma.user.findUnique({
      where: { emailConfirmationToken: token },
    });

    if (!user) {
      return res.status(404).json({ error: 'Token inválido o expirado' });
    }

    if (user.emailConfirmed) {
      return res.json({ message: 'La cuenta ya está confirmada.' });
    }

    if (
      user.emailConfirmationTokenExpiresAt &&
      new Date(user.emailConfirmationTokenExpiresAt) < new Date()
    ) {
      return res.status(400).json({ error: 'El token de confirmación ha expirado' });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailConfirmed: true,
        isActive: true,
        isVerified: true,
        emailConfirmationToken: null,
        emailConfirmationTokenExpiresAt: null,
      },
    });

    await sendEmail({
      userId: user.id,
      to: user.email,
      subject: '¡Tu cuenta en MiWeb está activa!',
      emailType: 'welcome',
      html: `<p>Hola ${user.name || ''},</p><p>Tu cuenta ya fue activada. Ya puedes iniciar sesión en MiWeb.</p>`,
      text: `Hola ${user.name || ''}, tu cuenta ya fue activada en MiWeb.`,
    });

    res.json({ message: 'Cuenta confirmada. Ya puedes iniciar sesión.' });
  } catch (error) {
    console.error('Error al confirmar email:', error);
    res.status(500).json({ error: 'Error al confirmar correo' });
  }
};

const resendConfirmationEmail = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email requerido' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });

    if (!user) {
      return res.status(200).json({ message: 'Si el email existe, se enviará un nuevo enlace.' });
    }

    if (user.emailConfirmed) {
      return res.status(400).json({ error: 'La cuenta ya está confirmada' });
    }

    const confirmationToken = generateRandomToken(24);
    const confirmationExpires = new Date(Date.now() + EMAIL_CONFIRMATION_WINDOW_MS).toISOString();

    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailConfirmationToken: confirmationToken,
        emailConfirmationTokenExpiresAt: confirmationExpires,
      },
    });

    const confirmationUrl = `${FRONTEND_URL}/auth/confirm-email?token=${confirmationToken}`;

    await sendEmail({
      userId: user.id,
      to: normalizedEmail,
      subject: 'Reenvío: confirma tu cuenta en MiWeb',
      emailType: 'confirmation',
      html: `<p>Hola ${user.name || ''},</p>
        <p>Solicitaste un nuevo enlace para activar tu cuenta. Haz clic en el siguiente botón:</p>
        <p><a href="${confirmationUrl}" style="display:inline-block;padding:10px 16px;background:#111;color:#fff;text-decoration:none;border-radius:6px;">Activar cuenta</a></p>`,
      text: `Confirma tu cuenta visitando: ${confirmationUrl}`,
    });

    res.json({ message: 'Nuevo enlace de confirmación enviado.' });
  } catch (error) {
    console.error('Error al reenviar confirmación:', error);
    res.status(500).json({ error: 'Error al reenviar confirmación' });
  }
};

const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email requerido' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });

    if (!user) {
      return res.status(200).json({ message: 'Si la cuenta existe, enviaremos instrucciones.' });
    }

    const resetToken = generateRandomToken(24);
    const resetExpires = new Date(Date.now() + PASSWORD_RESET_WINDOW_MS).toISOString();

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: resetToken,
        passwordResetTokenExpiresAt: resetExpires,
      },
    });

    const resetUrl = `${FRONTEND_URL}/auth/reset-password?token=${resetToken}`;

    await sendEmail({
      userId: user.id,
      to: normalizedEmail,
      subject: 'Recupera tu contraseña en MiWeb',
      emailType: 'password_reset',
      html: `<p>Hola ${user.name || ''},</p>
        <p>Haz clic en el botón para restablecer tu contraseña. El enlace expira en 1 hora.</p>
        <p><a href="${resetUrl}" style="display:inline-block;padding:10px 16px;background:#111;color:#fff;text-decoration:none;border-radius:6px;">Restablecer contraseña</a></p>`,
      text: `Restablece tu contraseña visitando: ${resetUrl}`,
    });

    res.json({ message: 'Si la cuenta existe, enviaremos instrucciones.' });
  } catch (error) {
    console.error('Error al solicitar reset password:', error);
    res.status(500).json({ error: 'Error al solicitar recuperación' });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) {
      return res.status(400).json({ error: 'Token y contraseña son requeridos' });
    }

    const user = await prisma.user.findUnique({ where: { passwordResetToken: token } });

    if (!user) {
      return res.status(404).json({ error: 'Token inválido' });
    }

    if (
      user.passwordResetTokenExpiresAt &&
      new Date(user.passwordResetTokenExpiresAt) < new Date()
    ) {
      return res.status(400).json({ error: 'El token ha expirado' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        passwordResetToken: null,
        passwordResetTokenExpiresAt: null,
      },
    });

    await sendEmail({
      userId: user.id,
      to: user.email,
      subject: 'Tu contraseña fue actualizada',
      emailType: 'password_changed',
      html: `<p>Hola ${user.name || ''},</p><p>Confirmamos que tu contraseña fue modificada correctamente.</p>`,
      text: `Hola ${user.name || ''}, confirmamos que tu contraseña fue modificada correctamente.`,
    });

    res.json({ message: 'Contraseña actualizada correctamente.' });
  } catch (error) {
    console.error('Error al resetear contraseña:', error);
    res.status(500).json({ error: 'Error al restablecer contraseña' });
  }
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
  registerWithToken,
  confirmEmail,
  resendConfirmationEmail,
  requestPasswordReset,
  resetPassword,
};
