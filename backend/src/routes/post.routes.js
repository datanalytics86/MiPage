const express = require('express');
const { body } = require('express-validator');
// Temporal: Usar JSON en lugar de Prisma por problemas de binarios
const { TempPrismaClient } = require('../utils/tempDB');
const { validationResult } = require('express-validator');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();
const prisma = new TempPrismaClient();

/**
 * @route   POST /api/posts
 * @desc    Crear nuevo post
 * @access  Private (Publisher)
 */
router.post(
  '/',
  authenticateToken,
  requireRole('PUBLISHER', 'ADMIN'),
  [
    body('content').notEmpty().withMessage('El contenido es requerido'),
    body('photos').optional().isArray().withMessage('Las fotos deben ser un array'),
    body('type')
      .optional()
      .isIn(['update', 'promotion', 'announcement'])
      .withMessage('Tipo de post inválido'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { content, photos, type } = req.body;

      const post = await prisma.post.create({
        data: {
          userId: req.user.id,
          content,
          photos: photos || [],
          type: type || 'update',
        },
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
      });

      res.status(201).json({
        message: 'Post creado exitosamente',
        post,
      });
    } catch (error) {
      console.error('Error al crear post:', error);
      res.status(500).json({
        error: 'Error al crear post',
      });
    }
  }
);

/**
 * @route   GET /api/posts/feed
 * @desc    Obtener feed de posts
 * @access  Public
 */
router.get('/feed', async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
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
      prisma.post.count(),
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
    console.error('Error al obtener feed:', error);
    res.status(500).json({
      error: 'Error al obtener posts',
    });
  }
});

/**
 * @route   DELETE /api/posts/:id
 * @desc    Eliminar post
 * @access  Private (Owner or Admin)
 */
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const post = await prisma.post.findUnique({
      where: { id },
    });

    if (!post) {
      return res.status(404).json({
        error: 'Post no encontrado',
      });
    }

    if (post.userId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        error: 'No tienes permisos para eliminar este post',
      });
    }

    await prisma.post.delete({
      where: { id },
    });

    res.json({
      message: 'Post eliminado exitosamente',
    });
  } catch (error) {
    console.error('Error al eliminar post:', error);
    res.status(500).json({
      error: 'Error al eliminar post',
    });
  }
});

module.exports = router;
