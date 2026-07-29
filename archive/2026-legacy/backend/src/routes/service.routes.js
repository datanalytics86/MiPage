const express = require('express');
const { body } = require('express-validator');
const {
  getServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
  getMyServices,
  toggleFavorite,
  getFavorites,
} = require('../controllers/service.controller');
const { authenticateToken, requireRole, optionalAuth } = require('../middleware/auth');

const router = express.Router();

/**
 * @route   GET /api/services
 * @desc    Obtener todos los servicios (con filtros)
 * @access  Public
 */
router.get('/', optionalAuth, getServices);

/**
 * @route   GET /api/services/my
 * @desc    Obtener servicios del usuario autenticado
 * @access  Private (Publisher)
 */
router.get('/my', authenticateToken, requireRole('PUBLISHER', 'ADMIN'), getMyServices);

/**
 * @route   GET /api/services/favorites
 * @desc    Obtener servicios favoritos
 * @access  Private
 */
router.get('/favorites', authenticateToken, getFavorites);

/**
 * @route   GET /api/services/:id
 * @desc    Obtener servicio por ID
 * @access  Public
 */
router.get('/:id', optionalAuth, getServiceById);

/**
 * @route   POST /api/services
 * @desc    Crear nuevo servicio
 * @access  Private (Publisher)
 */
router.post(
  '/',
  authenticateToken,
  requireRole('PUBLISHER', 'ADMIN'),
  [
    body('category')
      .isIn(['MODELAJE', 'MASAJES_PROFESIONALES'])
      .withMessage('Categoría inválida'),
    body('title').notEmpty().withMessage('El título es requerido'),
    body('description').notEmpty().withMessage('La descripción es requerida'),
    body('price').isNumeric().withMessage('El precio debe ser un número'),
    body('location').notEmpty().withMessage('La ubicación es requerida'),
    body('city').notEmpty().withMessage('La ciudad es requerida'),
    body('photos').optional().isArray().withMessage('Las fotos deben ser un array'),
  ],
  createService
);

/**
 * @route   PUT /api/services/:id
 * @desc    Actualizar servicio
 * @access  Private (Owner or Admin)
 */
router.put(
  '/:id',
  authenticateToken,
  requireRole('PUBLISHER', 'ADMIN'),
  [
    body('category')
      .optional()
      .isIn(['MODELAJE', 'MASAJES_PROFESIONALES'])
      .withMessage('Categoría inválida'),
    body('price').optional().isNumeric().withMessage('El precio debe ser un número'),
  ],
  updateService
);

/**
 * @route   DELETE /api/services/:id
 * @desc    Eliminar servicio
 * @access  Private (Owner or Admin)
 */
router.delete('/:id', authenticateToken, requireRole('PUBLISHER', 'ADMIN'), deleteService);

/**
 * @route   POST /api/services/:id/favorite
 * @desc    Toggle favorito
 * @access  Private
 */
router.post('/:id/favorite', authenticateToken, toggleFavorite);

module.exports = router;
