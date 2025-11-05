const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/**
 * Middleware para verificar token JWT
 */
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        error: 'Token de autenticación requerido',
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Buscar usuario en base de datos
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatar: true,
        isVerified: true,
      },
    });

    if (!user) {
      return res.status(401).json({
        error: 'Usuario no encontrado',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(403).json({
        error: 'Token inválido',
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(403).json({
        error: 'Token expirado',
      });
    }
    return res.status(500).json({
      error: 'Error al verificar autenticación',
    });
  }
};

/**
 * Middleware para verificar roles específicos
 */
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Autenticación requerida',
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'No tienes permisos para realizar esta acción',
        requiredRoles: roles,
        userRole: req.user.role,
      });
    }

    next();
  };
};

/**
 * Middleware opcional de autenticación (no falla si no hay token)
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatar: true,
      },
    });

    if (user) {
      req.user = user;
    }

    next();
  } catch (error) {
    // Ignorar errores de token en auth opcional
    next();
  }
};

module.exports = {
  authenticateToken,
  requireRole,
  optionalAuth,
};
