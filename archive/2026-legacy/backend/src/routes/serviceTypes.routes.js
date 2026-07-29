const express = require('express');
const router = express.Router();
const serviceTypesController = require('../controllers/serviceTypes.controller');

/**
 * Rutas públicas para tipos de servicio
 * Usadas para mostrar categorías en home page
 */

// @route   GET /api/service-types
// @desc    Obtener tipos de servicio activos
// @access  Public
router.get('/', serviceTypesController.getActiveServiceTypes);

module.exports = router;
