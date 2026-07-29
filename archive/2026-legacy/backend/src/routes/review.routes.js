const express = require('express');
const { body } = require('express-validator');
const {
  createReview,
  respondToReview,
  updateReview,
  deleteReview,
} = require('../controllers/review.controller');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

/**
 * @route   POST /api/reviews/:serviceId
 * @desc    Crear reseña para un servicio
 * @access  Private
 */
router.post(
  '/:serviceId',
  authenticateToken,
  [
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating debe ser entre 1 y 5'),
    body('comment').notEmpty().withMessage('El comentario es requerido'),
    body('photos').optional().isArray().withMessage('Las fotos deben ser un array'),
  ],
  createReview
);

/**
 * @route   PUT /api/reviews/:id/respond
 * @desc    Responder a una reseña
 * @access  Private (Publisher - owner)
 */
router.put(
  '/:id/respond',
  authenticateToken,
  requireRole('PUBLISHER', 'ADMIN'),
  [body('response').notEmpty().withMessage('La respuesta es requerida')],
  respondToReview
);

/**
 * @route   PUT /api/reviews/:id
 * @desc    Actualizar reseña
 * @access  Private (Owner)
 */
router.put(
  '/:id',
  authenticateToken,
  [
    body('rating').optional().isInt({ min: 1, max: 5 }).withMessage('Rating debe ser entre 1 y 5'),
    body('comment').optional().notEmpty().withMessage('El comentario no puede estar vacío'),
  ],
  updateReview
);

/**
 * @route   DELETE /api/reviews/:id
 * @desc    Eliminar reseña
 * @access  Private (Owner or Admin)
 */
router.delete('/:id', authenticateToken, deleteReview);

module.exports = router;
