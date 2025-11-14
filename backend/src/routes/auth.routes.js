const express = require('express');
const { body } = require('express-validator');
const {
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
} = require('../controllers/auth.controller');
const { authenticateToken } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

/**
 * @route   POST /api/auth/register
 * @desc    Registrar nuevo usuario
 * @access  Public
 */
router.post(
  '/register',
  authLimiter,
  [
    body('email').isEmail().withMessage('Email inválido'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('La contraseña debe tener al menos 6 caracteres'),
    body('name').notEmpty().withMessage('El nombre es requerido'),
    body('role').isIn(['USER', 'PUBLISHER']).withMessage('Rol inválido'),
    body('phone').notEmpty().withMessage('El teléfono es requerido'),
    body('acceptTerms')
      .custom((value) => value === true || value === 'true')
      .withMessage('Debes aceptar los términos y condiciones'),
  ],
  register
);

/**
 * @route   POST /api/auth/login
 * @desc    Iniciar sesión
 * @access  Public
 */
router.post(
  '/login',
  authLimiter,
  [
    body('email').isEmail().withMessage('Email inválido'),
    body('password').notEmpty().withMessage('La contraseña es requerida'),
    body('role').optional().isIn(['ADMIN', 'USER', 'PUBLISHER']).withMessage('Rol inválido'),
  ],
  login
);

/**
 * @route   GET /api/auth/profile
 * @desc    Obtener perfil del usuario autenticado
 * @access  Private
 */
router.get('/profile', authenticateToken, getProfile);

/**
 * @route   PUT /api/auth/profile
 * @desc    Actualizar perfil
 * @access  Private
 */
router.put(
  '/profile',
  authenticateToken,
  [
    body('name').optional().notEmpty().withMessage('El nombre no puede estar vacío'),
    body('phone').optional(),
    body('bio').optional(),
    body('avatar').optional().isURL().withMessage('Avatar debe ser una URL válida'),
  ],
  updateProfile
);

/**
 * @route   PUT /api/auth/change-password
 * @desc    Cambiar contraseña
 * @access  Private
 */
router.put(
  '/change-password',
  authenticateToken,
  [
    body('currentPassword').notEmpty().withMessage('Contraseña actual requerida'),
    body('newPassword')
      .isLength({ min: 6 })
      .withMessage('La nueva contraseña debe tener al menos 6 caracteres'),
  ],
  changePassword
);

/**
 * @route   POST /api/auth/register-with-token
 * @desc    Completar registro con token de invitación
 * @access  Public
 */
router.post(
  '/register-with-token',
  authLimiter,
  [
    body('token').notEmpty().withMessage('Token es requerido'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('La contraseña debe tener al menos 6 caracteres'),
    body('name').notEmpty().withMessage('El nombre es requerido'),
  ],
  registerWithToken
);

router.post(
  '/confirm-email',
  authLimiter,
  [body('token').notEmpty().withMessage('Token requerido')],
  confirmEmail
);

router.post(
  '/resend-confirmation',
  authLimiter,
  [body('email').isEmail().withMessage('Email inválido')],
  resendConfirmationEmail
);

router.post(
  '/forgot-password',
  authLimiter,
  [body('email').isEmail().withMessage('Email inválido')],
  requestPasswordReset
);

router.post(
  '/reset-password',
  authLimiter,
  [
    body('token').notEmpty().withMessage('Token requerido'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('La contraseña debe tener al menos 6 caracteres'),
  ],
  resetPassword
);

module.exports = router;
