const express = require('express');
const router = express.Router();
const metadataFieldsController = require('../controllers/metadataFields.controller');

/**
 * Rutas públicas para metadata fields
 * Usadas para cargar campos en formularios de registro
 */

// @route   GET /api/metadata-fields/active
// @desc    Obtener campos activos para formularios
// @access  Public
router.get('/active', metadataFieldsController.getActiveFields);

module.exports = router;
