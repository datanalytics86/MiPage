const { PrismaClient } = require('@prisma/client');
const { validationResult } = require('express-validator');

const prisma = new PrismaClient();

/**
 * Obtener todos los servicios (con filtros)
 */
const getServices = async (req, res) => {
  try {
    const {
      category,
      city,
      minPrice,
      maxPrice,
      search,
      status = 'APPROVED',
      page = 1,
      limit = 12,
      sortBy = 'createdAt',
      order = 'desc',
    } = req.query;

    // Construir filtros
    const where = {
      status: req.user?.role === 'ADMIN' ? undefined : status,
      ...(category && { category }),
      ...(city && { city: { contains: city, mode: 'insensitive' } }),
      ...(minPrice && { price: { gte: parseFloat(minPrice) } }),
      ...(maxPrice && { price: { lte: parseFloat(maxPrice) } }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
          { location: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    // Calcular paginación
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    // Obtener servicios y total
    const [services, total] = await Promise.all([
      prisma.service.findMany({
        where,
        skip,
        take,
        orderBy: { [sortBy]: order },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatar: true,
              isVerified: true,
            },
          },
          _count: {
            select: {
              reviews: true,
              favorites: true,
            },
          },
        },
      }),
      prisma.service.count({ where }),
    ]);

    // Calcular rating promedio para cada servicio
    const servicesWithRating = await Promise.all(
      services.map(async (service) => {
        const ratings = await prisma.review.aggregate({
          where: { serviceId: service.id },
          _avg: { rating: true },
        });

        return {
          ...service,
          averageRating: ratings._avg.rating || 0,
        };
      })
    );

    res.json({
      services: servicesWithRating,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('Error al obtener servicios:', error);
    res.status(500).json({
      error: 'Error al obtener servicios',
    });
  }
};

/**
 * Obtener un servicio por ID
 */
const getServiceById = async (req, res) => {
  try {
    const { id } = req.params;

    const service = await prisma.service.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
            bio: true,
            isVerified: true,
            createdAt: true,
            _count: {
              select: {
                services: true,
                reviews: true,
              },
            },
          },
        },
        reviews: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        _count: {
          select: {
            favorites: true,
          },
        },
      },
    });

    if (!service) {
      return res.status(404).json({
        error: 'Servicio no encontrado',
      });
    }

    // Incrementar contador de vistas
    await prisma.service.update({
      where: { id },
      data: { views: { increment: 1 } },
    });

    // Calcular rating promedio
    const ratings = await prisma.review.aggregate({
      where: { serviceId: id },
      _avg: { rating: true },
      _count: true,
    });

    // Verificar si el usuario actual tiene este servicio en favoritos
    let isFavorite = false;
    if (req.user) {
      const favorite = await prisma.favorite.findUnique({
        where: {
          userId_serviceId: {
            userId: req.user.id,
            serviceId: id,
          },
        },
      });
      isFavorite = !!favorite;
    }

    res.json({
      ...service,
      averageRating: ratings._avg.rating || 0,
      totalReviews: ratings._count,
      isFavorite,
    });
  } catch (error) {
    console.error('Error al obtener servicio:', error);
    res.status(500).json({
      error: 'Error al obtener servicio',
    });
  }
};

/**
 * Crear nuevo servicio
 */
const createService = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      category,
      title,
      description,
      price,
      priceType,
      location,
      city,
      region,
      photos,
      availability,
    } = req.body;

    const service = await prisma.service.create({
      data: {
        userId: req.user.id,
        category,
        title,
        description,
        price: parseFloat(price),
        priceType: priceType || 'hour',
        location,
        city,
        region,
        photos: photos || [],
        coverPhoto: photos?.[0] || null,
        availability,
        status: 'PENDING', // Requiere aprobación de admin
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    });

    // Enviar notificación a admins (Socket.io)
    const io = req.app.get('io');
    io.emit('new_service_pending', {
      serviceId: service.id,
      title: service.title,
      userId: service.userId,
    });

    res.status(201).json({
      message: 'Servicio creado exitosamente. Pendiente de aprobación.',
      service,
    });
  } catch (error) {
    console.error('Error al crear servicio:', error);
    res.status(500).json({
      error: 'Error al crear servicio',
    });
  }
};

/**
 * Actualizar servicio
 */
const updateService = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar que el servicio existe y pertenece al usuario
    const existingService = await prisma.service.findUnique({
      where: { id },
    });

    if (!existingService) {
      return res.status(404).json({
        error: 'Servicio no encontrado',
      });
    }

    if (existingService.userId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        error: 'No tienes permisos para editar este servicio',
      });
    }

    const {
      category,
      title,
      description,
      price,
      priceType,
      location,
      city,
      region,
      photos,
      availability,
    } = req.body;

    const updatedService = await prisma.service.update({
      where: { id },
      data: {
        ...(category && { category }),
        ...(title && { title }),
        ...(description && { description }),
        ...(price && { price: parseFloat(price) }),
        ...(priceType && { priceType }),
        ...(location && { location }),
        ...(city && { city }),
        ...(region !== undefined && { region }),
        ...(photos && {
          photos,
          coverPhoto: photos[0] || existingService.coverPhoto,
        }),
        ...(availability !== undefined && { availability }),
        // Si se actualiza, vuelve a pending
        ...(req.user.role !== 'ADMIN' && { status: 'PENDING' }),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    });

    res.json({
      message: 'Servicio actualizado exitosamente',
      service: updatedService,
    });
  } catch (error) {
    console.error('Error al actualizar servicio:', error);
    res.status(500).json({
      error: 'Error al actualizar servicio',
    });
  }
};

/**
 * Eliminar servicio
 */
const deleteService = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar que el servicio existe y pertenece al usuario
    const service = await prisma.service.findUnique({
      where: { id },
    });

    if (!service) {
      return res.status(404).json({
        error: 'Servicio no encontrado',
      });
    }

    if (service.userId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        error: 'No tienes permisos para eliminar este servicio',
      });
    }

    await prisma.service.delete({
      where: { id },
    });

    res.json({
      message: 'Servicio eliminado exitosamente',
    });
  } catch (error) {
    console.error('Error al eliminar servicio:', error);
    res.status(500).json({
      error: 'Error al eliminar servicio',
    });
  }
};

/**
 * Obtener servicios del usuario autenticado
 */
const getMyServices = async (req, res) => {
  try {
    const services = await prisma.service.findMany({
      where: { userId: req.user.id },
      include: {
        _count: {
          select: {
            reviews: true,
            favorites: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Calcular rating promedio para cada servicio
    const servicesWithRating = await Promise.all(
      services.map(async (service) => {
        const ratings = await prisma.review.aggregate({
          where: { serviceId: service.id },
          _avg: { rating: true },
        });

        return {
          ...service,
          averageRating: ratings._avg.rating || 0,
        };
      })
    );

    res.json(servicesWithRating);
  } catch (error) {
    console.error('Error al obtener mis servicios:', error);
    res.status(500).json({
      error: 'Error al obtener servicios',
    });
  }
};

/**
 * Toggle favorito
 */
const toggleFavorite = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar si ya existe
    const existingFavorite = await prisma.favorite.findUnique({
      where: {
        userId_serviceId: {
          userId: req.user.id,
          serviceId: id,
        },
      },
    });

    if (existingFavorite) {
      // Eliminar favorito
      await prisma.favorite.delete({
        where: {
          userId_serviceId: {
            userId: req.user.id,
            serviceId: id,
          },
        },
      });

      return res.json({
        message: 'Servicio eliminado de favoritos',
        isFavorite: false,
      });
    } else {
      // Crear favorito
      await prisma.favorite.create({
        data: {
          userId: req.user.id,
          serviceId: id,
        },
      });

      // Notificar al dueño del servicio
      const service = await prisma.service.findUnique({
        where: { id },
        select: { userId: true, title: true },
      });

      await prisma.notification.create({
        data: {
          userId: service.userId,
          title: 'Nuevo favorito',
          message: `A ${req.user.name} le gustó tu servicio`,
          type: 'favorite',
          link: `/services/${id}`,
        },
      });

      // Socket.io notification
      const io = req.app.get('io');
      io.to(`user_${service.userId}`).emit('notification', {
        title: 'Nuevo favorito',
        message: `A ${req.user.name} le gustó tu servicio`,
      });

      return res.json({
        message: 'Servicio agregado a favoritos',
        isFavorite: true,
      });
    }
  } catch (error) {
    console.error('Error al toggle favorito:', error);
    res.status(500).json({
      error: 'Error al actualizar favorito',
    });
  }
};

/**
 * Obtener servicios favoritos del usuario
 */
const getFavorites = async (req, res) => {
  try {
    const favorites = await prisma.favorite.findMany({
      where: { userId: req.user.id },
      include: {
        service: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
            _count: {
              select: {
                reviews: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Calcular rating promedio
    const favoritesWithRating = await Promise.all(
      favorites.map(async (fav) => {
        const ratings = await prisma.review.aggregate({
          where: { serviceId: fav.service.id },
          _avg: { rating: true },
        });

        return {
          ...fav.service,
          averageRating: ratings._avg.rating || 0,
        };
      })
    );

    res.json(favoritesWithRating);
  } catch (error) {
    console.error('Error al obtener favoritos:', error);
    res.status(500).json({
      error: 'Error al obtener favoritos',
    });
  }
};

module.exports = {
  getServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
  getMyServices,
  toggleFavorite,
  getFavorites,
};
