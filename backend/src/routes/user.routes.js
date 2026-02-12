const express = require('express');
const prisma = require('../lib/prisma');
const { optionalAuth, authenticateToken } = require('../middleware/auth');

const router = express.Router();

/**
 * @route   GET /api/users/:id
 * @desc    Obtener perfil público de usuario
 * @access  Public
 */
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
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
            posts: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({
        error: 'Usuario no encontrado',
      });
    }

    res.json(user);
  } catch (error) {
    console.error('Error al obtener usuario:', error);
    res.status(500).json({
      error: 'Error al obtener usuario',
    });
  }
});

/**
 * @route   GET /api/users/:id/services
 * @desc    Obtener servicios de un usuario
 * @access  Public
 */
router.get('/:id/services', async (req, res) => {
  try {
    const { id } = req.params;

    const services = await prisma.service.findMany({
      where: {
        userId: id,
        status: 'APPROVED',
      },
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

    res.json(services);
  } catch (error) {
    console.error('Error al obtener servicios del usuario:', error);
    res.status(500).json({
      error: 'Error al obtener servicios',
    });
  }
});

/**
 * @route   GET /api/users/:id/posts
 * @desc    Obtener posts de un usuario (timeline)
 * @access  Public
 */
router.get('/:id/posts', async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where: { userId: id },
        skip,
        take,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatar: true,
              isVerified: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.post.count({ where: { userId: id } }),
    ]);

    res.json({
      posts,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('Error al obtener posts del usuario:', error);
    res.status(500).json({
      error: 'Error al obtener posts',
    });
  }
});

/**
 * @route   GET /api/users/:id/reviews
 * @desc    Obtener reseñas de un usuario
 * @access  Public
 */
router.get('/:id/reviews', async (req, res) => {
  try {
    const { id } = req.params;

    const reviews = await prisma.review.findMany({
      where: { userId: id },
      include: {
        service: {
          select: {
            id: true,
            title: true,
            coverPhoto: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(reviews);
  } catch (error) {
    console.error('Error al obtener reseñas del usuario:', error);
    res.status(500).json({
      error: 'Error al obtener reseñas',
    });
  }
});

/**
 * @route   GET /api/users/me/notifications
 * @desc    Obtener notificaciones del usuario autenticado
 * @access  Private
 */
router.get('/me/notifications', authenticateToken, async (req, res) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    const unreadCount = await prisma.notification.count({
      where: {
        userId: req.user.id,
        isRead: false,
      },
    });

    res.json({
      notifications,
      unreadCount,
    });
  } catch (error) {
    console.error('Error al obtener notificaciones:', error);
    res.status(500).json({
      error: 'Error al obtener notificaciones',
    });
  }
});

/**
 * @route   PUT /api/users/me/notifications/:id/read
 * @desc    Marcar notificación como leída
 * @access  Private
 */
router.put('/me/notifications/:id/read', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.notification.update({
      where: {
        id,
        userId: req.user.id,
      },
      data: {
        isRead: true,
      },
    });

    res.json({
      message: 'Notificación marcada como leída',
    });
  } catch (error) {
    console.error('Error al marcar notificación:', error);
    res.status(500).json({
      error: 'Error al actualizar notificación',
    });
  }
});

module.exports = router;
