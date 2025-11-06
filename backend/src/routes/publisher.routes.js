const express = require('express');
const router = express.Router();
const { authenticateToken, isPublisher } = require('../middleware/auth');
const publisherDashboardController = require('../controllers/publisherDashboard.controller');

/**
 * Rutas para publishers
 * Todas requieren autenticación y rol de PUBLISHER o ADMIN
 */

// Aplicar middleware de autenticación a todas las rutas
router.use(authenticateToken);
router.use(isPublisher);

// @route   GET /api/publisher/dashboard
// @desc    Obtener datos del dashboard del publisher
// @access  Private/Publisher
router.get('/dashboard', publisherDashboardController.getDashboardData);

// @route   GET /api/publisher/stats
// @desc    Obtener estadísticas detalladas
// @access  Private/Publisher
router.get('/stats', publisherDashboardController.getDetailedStats);

// Service Updates Routes

// @route   POST /api/publisher/services/:id/updates
// @desc    Crear actualización de servicio
// @access  Private/Publisher
router.post('/services/:id/updates', publisherDashboardController.createServiceUpdate);

// @route   GET /api/publisher/services/:id/updates
// @desc    Obtener actualizaciones de un servicio
// @access  Private/Publisher
router.get('/services/:id/updates', publisherDashboardController.getServiceUpdates);

// @route   PATCH /api/publisher/services/:serviceId/updates/:updateId
// @desc    Actualizar una actualización de servicio
// @access  Private/Publisher
router.patch(
  '/services/:serviceId/updates/:updateId',
  publisherDashboardController.updateServiceUpdate
);

// @route   DELETE /api/publisher/services/:serviceId/updates/:updateId
// @desc    Eliminar una actualización de servicio
// @access  Private/Publisher
router.delete(
  '/services/:serviceId/updates/:updateId',
  publisherDashboardController.deleteServiceUpdate
);

module.exports = router;
