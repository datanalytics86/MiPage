const prisma = require('../lib/prisma');

/**
 * @desc    Obtener datos del dashboard del publisher
 * @route   GET /api/publisher/dashboard
 * @access  Private/Publisher
 */
exports.getDashboardData = async (req, res) => {
  try {
    const userId = req.user.id;

    const [services, stats, recentReviews] = await Promise.all([
      // Servicios del publisher
      prisma.service.findMany({
        where: { userId },
        include: {
          reviews: {
            select: {
              rating: true,
            },
          },
          updates: {
            where: { isActive: true },
            orderBy: { createdAt: 'desc' },
            take: 5,
          },
          _count: {
            select: {
              reviews: true,
              favorites: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),

      // Estadísticas generales
      prisma.service.aggregate({
        where: { userId },
        _sum: {
          viewCount: true,
          views: true,
        },
        _avg: {
          price: true,
        },
        _count: true,
      }),

      // Reseñas recientes
      prisma.review.findMany({
        where: {
          service: {
            userId,
          },
        },
        include: {
          user: {
            select: {
              name: true,
              avatar: true,
            },
          },
          service: {
            select: {
              title: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
    ]);

    // Calcular estadísticas
    const totalServices = services.length;
    const activeServices = services.filter(s => s.status === 'APPROVED').length;
    const pendingServices = services.filter(s => s.status === 'PENDING').length;

    // Calcular rating promedio
    const allReviews = services.flatMap(s => s.reviews);
    const totalReviews = allReviews.length;
    const avgRating = totalReviews > 0
      ? (allReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1)
      : 0;

    // Total de vistas (sumar viewCount y views para compatibilidad)
    const totalViews = (stats._sum.viewCount || 0) + (stats._sum.views || 0);

    res.json({
      success: true,
      data: {
        services,
        recentReviews,
        stats: {
          totalServices,
          activeServices,
          pendingServices,
          totalViews,
          totalReviews,
          avgRating: parseFloat(avgRating),
          avgPrice: stats._avg.price || 0,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching dashboard:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener dashboard',
      message: error.message,
    });
  }
};

/**
 * @desc    Crear actualización de servicio
 * @route   POST /api/publisher/services/:id/updates
 * @access  Private/Publisher
 */
exports.createServiceUpdate = async (req, res) => {
  try {
    const { id: serviceId } = req.params;
    const userId = req.user.id;
    const { type, title, content, imageUrl, isPinned } = req.body;

    // Validar campos requeridos
    if (!type || !content) {
      return res.status(400).json({
        success: false,
        error: 'Los campos type y content son requeridos',
      });
    }

    // Verificar que el servicio pertenezca al usuario
    const service = await prisma.service.findFirst({
      where: {
        id: serviceId,
        userId,
      },
    });

    if (!service) {
      return res.status(404).json({
        success: false,
        error: 'Servicio no encontrado o no tienes permiso para modificarlo',
      });
    }

    // Crear actualización
    const update = await prisma.serviceUpdate.create({
      data: {
        serviceId,
        type,
        title,
        content,
        imageUrl,
        isPinned: isPinned || false,
      },
    });

    res.status(201).json({
      success: true,
      data: update,
      message: 'Actualización creada exitosamente',
    });
  } catch (error) {
    console.error('Error creating update:', error);
    res.status(500).json({
      success: false,
      error: 'Error al crear actualización',
      message: error.message,
    });
  }
};

/**
 * @desc    Obtener actualizaciones de un servicio
 * @route   GET /api/publisher/services/:id/updates
 * @access  Private/Publisher
 */
exports.getServiceUpdates = async (req, res) => {
  try {
    const { id: serviceId } = req.params;
    const userId = req.user.id;

    // Verificar que el servicio pertenezca al usuario
    const service = await prisma.service.findFirst({
      where: {
        id: serviceId,
        userId,
      },
    });

    if (!service) {
      return res.status(404).json({
        success: false,
        error: 'Servicio no encontrado o no tienes permiso para verlo',
      });
    }

    // Obtener actualizaciones
    const updates = await prisma.serviceUpdate.findMany({
      where: { serviceId },
      orderBy: [
        { isPinned: 'desc' },
        { createdAt: 'desc' },
      ],
    });

    res.json({
      success: true,
      count: updates.length,
      data: updates,
    });
  } catch (error) {
    console.error('Error fetching updates:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener actualizaciones',
      message: error.message,
    });
  }
};

/**
 * @desc    Actualizar una actualización de servicio
 * @route   PATCH /api/publisher/services/:serviceId/updates/:updateId
 * @access  Private/Publisher
 */
exports.updateServiceUpdate = async (req, res) => {
  try {
    const { serviceId, updateId } = req.params;
    const userId = req.user.id;

    // Verificar ownership del servicio
    const service = await prisma.service.findFirst({
      where: {
        id: serviceId,
        userId,
      },
    });

    if (!service) {
      return res.status(404).json({
        success: false,
        error: 'Servicio no encontrado o no tienes permiso para modificarlo',
      });
    }

    // Verificar que el update pertenezca al servicio
    const existingUpdate = await prisma.serviceUpdate.findFirst({
      where: {
        id: updateId,
        serviceId,
      },
    });

    if (!existingUpdate) {
      return res.status(404).json({
        success: false,
        error: 'Actualización no encontrada',
      });
    }

    // Actualizar
    const update = await prisma.serviceUpdate.update({
      where: { id: updateId },
      data: req.body,
    });

    res.json({
      success: true,
      data: update,
      message: 'Actualización modificada exitosamente',
    });
  } catch (error) {
    console.error('Error updating update:', error);
    res.status(500).json({
      success: false,
      error: 'Error al actualizar',
      message: error.message,
    });
  }
};

/**
 * @desc    Eliminar una actualización de servicio
 * @route   DELETE /api/publisher/services/:serviceId/updates/:updateId
 * @access  Private/Publisher
 */
exports.deleteServiceUpdate = async (req, res) => {
  try {
    const { serviceId, updateId } = req.params;
    const userId = req.user.id;

    // Verificar ownership del servicio
    const service = await prisma.service.findFirst({
      where: {
        id: serviceId,
        userId,
      },
    });

    if (!service) {
      return res.status(404).json({
        success: false,
        error: 'Servicio no encontrado o no tienes permiso para modificarlo',
      });
    }

    // Verificar que el update pertenezca al servicio
    const existingUpdate = await prisma.serviceUpdate.findFirst({
      where: {
        id: updateId,
        serviceId,
      },
    });

    if (!existingUpdate) {
      return res.status(404).json({
        success: false,
        error: 'Actualización no encontrada',
      });
    }

    // Eliminar
    await prisma.serviceUpdate.delete({
      where: { id: updateId },
    });

    res.json({
      success: true,
      message: 'Actualización eliminada exitosamente',
    });
  } catch (error) {
    console.error('Error deleting update:', error);
    res.status(500).json({
      success: false,
      error: 'Error al eliminar actualización',
      message: error.message,
    });
  }
};

/**
 * @desc    Obtener estadísticas detalladas
 * @route   GET /api/publisher/stats
 * @access  Private/Publisher
 */
exports.getDetailedStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const { period = '30' } = req.query; // días

    const dateFrom = new Date();
    dateFrom.setDate(dateFrom.getDate() - parseInt(period));

    const [
      totalServices,
      recentViews,
      recentReviews,
      favoriteCount,
    ] = await Promise.all([
      // Total de servicios por estado
      prisma.service.groupBy({
        by: ['status'],
        where: { userId },
        _count: true,
      }),

      // Vistas recientes (si tuvieras un modelo de tracking)
      // Por ahora retornamos el total
      prisma.service.aggregate({
        where: {
          userId,
          createdAt: { gte: dateFrom },
        },
        _sum: {
          views: true,
          viewCount: true,
        },
      }),

      // Reseñas recientes
      prisma.review.count({
        where: {
          service: { userId },
          createdAt: { gte: dateFrom },
        },
      }),

      // Total de favoritos
      prisma.favorite.count({
        where: {
          service: { userId },
        },
      }),
    ]);

    res.json({
      success: true,
      data: {
        period: parseInt(period),
        services: totalServices,
        recentViews: (recentViews._sum.views || 0) + (recentViews._sum.viewCount || 0),
        recentReviews,
        favoriteCount,
      },
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener estadísticas',
      message: error.message,
    });
  }
};
