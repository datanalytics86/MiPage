const express = require('express');
// Temporal: Usar JSON en lugar de Prisma por problemas de binarios
const { TempPrismaClient } = require('../utils/tempDB');
const { authenticateToken, requireRole } = require('../middleware/auth');
const metadataFieldsController = require('../controllers/metadataFields.controller');
const userManagementController = require('../controllers/userManagement.controller');
const serviceTypesController = require('../controllers/serviceTypes.controller');

const router = express.Router();
const prisma = new TempPrismaClient();

// Proteger todas las rutas admin
router.use(authenticateToken);
router.use(requireRole('ADMIN'));

/**
 * @route   GET /api/admin/stats
 * @desc    Obtener estadísticas del sitio
 * @access  Admin
 */
router.get('/stats', async (req, res) => {
  try {
    const [
      totalUsers,
      totalPublishers,
      totalServices,
      pendingServices,
      approvedServices,
      totalReviews,
      totalPosts,
    ] = await Promise.all([
      prisma.user.count({ where: { role: 'USER' } }),
      prisma.user.count({ where: { role: 'PUBLISHER' } }),
      prisma.service.count(),
      prisma.service.count({ where: { status: 'PENDING' } }),
      prisma.service.count({ where: { status: 'APPROVED' } }),
      prisma.review.count(),
      prisma.post.count(),
    ]);

    // Servicios por categoría
    const servicesByCategory = await prisma.service.groupBy({
      by: ['category'],
      _count: true,
    });

    // Estadísticas de rating promedio
    const avgRating = await prisma.review.aggregate({
      _avg: { rating: true },
    });

    res.json({
      users: {
        total: totalUsers,
        publishers: totalPublishers,
      },
      services: {
        total: totalServices,
        pending: pendingServices,
        approved: approvedServices,
        byCategory: servicesByCategory,
      },
      reviews: {
        total: totalReviews,
        averageRating: avgRating._avg.rating || 0,
      },
      posts: {
        total: totalPosts,
      },
    });
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({
      error: 'Error al obtener estadísticas',
    });
  }
});

/**
 * @route   GET /api/admin/services/pending
 * @desc    Obtener servicios pendientes de aprobación
 * @access  Admin
 */
router.get('/services/pending', async (req, res) => {
  try {
    const services = await prisma.service.findMany({
      where: { status: 'PENDING' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    res.json(services);
  } catch (error) {
    console.error('Error al obtener servicios pendientes:', error);
    res.status(500).json({
      error: 'Error al obtener servicios',
    });
  }
});

/**
 * @route   PUT /api/admin/services/:id/approve
 * @desc    Aprobar servicio
 * @access  Admin
 */
router.put('/services/:id/approve', async (req, res) => {
  try {
    const { id } = req.params;

    const service = await prisma.service.update({
      where: { id },
      data: { status: 'APPROVED' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Crear notificación para el publisher
    await prisma.notification.create({
      data: {
        userId: service.userId,
        title: 'Servicio aprobado',
        message: `Tu servicio "${service.title}" ha sido aprobado`,
        type: 'service_approved',
        link: `/services/${service.id}`,
      },
    });

    // Socket.io notification
    const io = req.app.get('io');
    io.to(`user_${service.userId}`).emit('notification', {
      title: 'Servicio aprobado',
      message: `Tu servicio "${service.title}" ha sido aprobado`,
    });

    res.json({
      message: 'Servicio aprobado exitosamente',
      service,
    });
  } catch (error) {
    console.error('Error al aprobar servicio:', error);
    res.status(500).json({
      error: 'Error al aprobar servicio',
    });
  }
});

/**
 * @route   PUT /api/admin/services/:id/reject
 * @desc    Rechazar servicio
 * @access  Admin
 */
router.put('/services/:id/reject', async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const service = await prisma.service.update({
      where: { id },
      data: { status: 'REJECTED' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Crear notificación para el publisher
    await prisma.notification.create({
      data: {
        userId: service.userId,
        title: 'Servicio rechazado',
        message: reason || `Tu servicio "${service.title}" ha sido rechazado`,
        type: 'service_rejected',
        link: `/services/${service.id}`,
      },
    });

    res.json({
      message: 'Servicio rechazado',
      service,
    });
  } catch (error) {
    console.error('Error al rechazar servicio:', error);
    res.status(500).json({
      error: 'Error al rechazar servicio',
    });
  }
});

/**
 * @route   GET /api/admin/users
 * @desc    Obtener todos los usuarios
 * @access  Admin
 */
router.get('/users', async (req, res) => {
  try {
    const { page = 1, limit = 20, role, search } = req.query;

    const where = {
      ...(role && { role }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          avatar: true,
          isVerified: true,
          createdAt: true,
          _count: {
            select: {
              services: true,
              reviews: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where }),
    ]);

    res.json({
      users,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({
      error: 'Error al obtener usuarios',
    });
  }
});

/**
 * @route   DELETE /api/admin/users/:id
 * @desc    Eliminar usuario
 * @access  Admin
 */
router.delete('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (id === req.user.id) {
      return res.status(400).json({
        error: 'No puedes eliminar tu propia cuenta',
      });
    }

    await prisma.user.delete({
      where: { id },
    });

    res.json({
      message: 'Usuario eliminado exitosamente',
    });
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    res.status(500).json({
      error: 'Error al eliminar usuario',
    });
  }
});

/**
 * @route   PUT /api/admin/users/:id/verify
 * @desc    Verificar usuario
 * @access  Admin
 */
router.put('/users/:id/verify', async (req, res) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.update({
      where: { id },
      data: { isVerified: true },
    });

    // Crear notificación
    await prisma.notification.create({
      data: {
        userId: id,
        title: 'Cuenta verificada',
        message: 'Tu cuenta ha sido verificada',
        type: 'account_verified',
      },
    });

    res.json({
      message: 'Usuario verificado exitosamente',
      user,
    });
  } catch (error) {
    console.error('Error al verificar usuario:', error);
    res.status(500).json({
      error: 'Error al verificar usuario',
    });
  }
});

/**
 * ============================================
 * NUEVAS RUTAS - SISTEMA DE METADATA
 * ============================================
 */

// === METADATA FIELDS ===
router.get('/metadata-fields', metadataFieldsController.getAllFields);
router.post('/metadata-fields', metadataFieldsController.createField);
router.patch('/metadata-fields/:id', metadataFieldsController.updateField);
router.delete('/metadata-fields/:id', metadataFieldsController.deleteField);
router.patch('/metadata-fields/reorder', metadataFieldsController.reorderFields);

// === USER MANAGEMENT (con metadata) ===
router.get('/users/with-metadata', userManagementController.getUsersWithMetadata);
router.get('/users/:id/full', userManagementController.getUserFull);
router.patch('/users/:id/toggle-active', userManagementController.toggleUserActive);
router.post('/users/invite', userManagementController.inviteUser);
router.get('/users/export', userManagementController.exportToExcel);
router.patch('/users/:id/metadata', userManagementController.updateUserMetadata);

// === SERVICE TYPES ===
router.get('/service-types', serviceTypesController.getAllServiceTypes);
router.post('/service-types', serviceTypesController.createServiceType);
router.patch('/service-types/:id', serviceTypesController.updateServiceType);
router.delete('/service-types/:id', serviceTypesController.deleteServiceType);
router.patch('/service-types/reorder', serviceTypesController.reorderServiceTypes);

module.exports = router;
