const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

const prisma = new PrismaClient();

/**
 * Generar JWT token
 */
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

/**
 * Registro de nuevo usuario
 */
const register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, name, role } = req.body;

    // Verificar si el usuario ya existe
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(409).json({
        error: 'El email ya está registrado',
      });
    }

    // Hash de contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear usuario
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: role || 'USER',
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });

    // Generar token
    const token = generateToken(user.id);

    res.status(201).json({
      message: 'Usuario registrado exitosamente',
      user,
      token,
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

    const { email, password } = req.body;

    // Buscar usuario
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({
        error: 'Credenciales inválidas',
      });
    }

    // Verificar contraseña
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        error: 'Credenciales inválidas',
      });
    }

    // Generar token
    const token = generateToken(user.id);

    // Datos del usuario (sin contraseña)
    const userData = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      avatar: user.avatar,
      isVerified: user.isVerified,
    };

    res.json({
      message: 'Login exitoso',
      user: userData,
      token,
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

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
};
