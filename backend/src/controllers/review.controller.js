const { PrismaClient } = require('@prisma/client');
const { validationResult } = require('express-validator');

const prisma = new PrismaClient();

/**
 * Crear reseña
 */
const createReview = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { serviceId } = req.params;
    const { rating, comment, photos } = req.body;

    // Verificar que el servicio existe
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
    });

    if (!service) {
      return res.status(404).json({
        error: 'Servicio no encontrado',
      });
    }

    // No permitir reseñas propias
    if (service.userId === req.user.id) {
      return res.status(400).json({
        error: 'No puedes dejar una reseña en tu propio servicio',
      });
    }

    // Verificar si ya existe una reseña
    const existingReview = await prisma.review.findUnique({
      where: {
        serviceId_userId: {
          serviceId,
          userId: req.user.id,
        },
      },
    });

    if (existingReview) {
      return res.status(409).json({
        error: 'Ya has dejado una reseña para este servicio',
      });
    }

    // Crear reseña
    const review = await prisma.review.create({
      data: {
        serviceId,
        userId: req.user.id,
        rating: parseInt(rating),
        comment,
        photos: photos || [],
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

    // Crear notificación para el dueño del servicio
    await prisma.notification.create({
      data: {
        userId: service.userId,
        title: 'Nueva reseña',
        message: `${req.user.name} dejó una reseña en tu servicio`,
        type: 'review',
        link: `/services/${serviceId}`,
      },
    });

    // Socket.io notification
    const io = req.app.get('io');
    io.to(`user_${service.userId}`).emit('notification', {
      title: 'Nueva reseña',
      message: `${req.user.name} dejó una reseña en tu servicio`,
      rating,
    });

    res.status(201).json({
      message: 'Reseña creada exitosamente',
      review,
    });
  } catch (error) {
    console.error('Error al crear reseña:', error);
    res.status(500).json({
      error: 'Error al crear reseña',
    });
  }
};

/**
 * Responder a una reseña
 */
const respondToReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { response } = req.body;

    const review = await prisma.review.findUnique({
      where: { id },
      include: {
        service: true,
      },
    });

    if (!review) {
      return res.status(404).json({
        error: 'Reseña no encontrada',
      });
    }

    // Solo el dueño del servicio puede responder
    if (review.service.userId !== req.user.id) {
      return res.status(403).json({
        error: 'No tienes permisos para responder esta reseña',
      });
    }

    const updatedReview = await prisma.review.update({
      where: { id },
      data: {
        response,
        respondedAt: new Date(),
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

    // Notificar al usuario que dejó la reseña
    await prisma.notification.create({
      data: {
        userId: review.userId,
        title: 'Respuesta a tu reseña',
        message: `${req.user.name} respondió a tu reseña`,
        type: 'review_response',
        link: `/services/${review.serviceId}`,
      },
    });

    res.json({
      message: 'Respuesta agregada exitosamente',
      review: updatedReview,
    });
  } catch (error) {
    console.error('Error al responder reseña:', error);
    res.status(500).json({
      error: 'Error al responder reseña',
    });
  }
};

/**
 * Actualizar reseña
 */
const updateReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment, photos } = req.body;

    const review = await prisma.review.findUnique({
      where: { id },
    });

    if (!review) {
      return res.status(404).json({
        error: 'Reseña no encontrada',
      });
    }

    if (review.userId !== req.user.id) {
      return res.status(403).json({
        error: 'No tienes permisos para editar esta reseña',
      });
    }

    const updatedReview = await prisma.review.update({
      where: { id },
      data: {
        ...(rating && { rating: parseInt(rating) }),
        ...(comment && { comment }),
        ...(photos && { photos }),
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
      message: 'Reseña actualizada exitosamente',
      review: updatedReview,
    });
  } catch (error) {
    console.error('Error al actualizar reseña:', error);
    res.status(500).json({
      error: 'Error al actualizar reseña',
    });
  }
};

/**
 * Eliminar reseña
 */
const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;

    const review = await prisma.review.findUnique({
      where: { id },
    });

    if (!review) {
      return res.status(404).json({
        error: 'Reseña no encontrada',
      });
    }

    if (review.userId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        error: 'No tienes permisos para eliminar esta reseña',
      });
    }

    await prisma.review.delete({
      where: { id },
    });

    res.json({
      message: 'Reseña eliminada exitosamente',
    });
  } catch (error) {
    console.error('Error al eliminar reseña:', error);
    res.status(500).json({
      error: 'Error al eliminar reseña',
    });
  }
};

module.exports = {
  createReview,
  respondToReview,
  updateReview,
  deleteReview,
};
