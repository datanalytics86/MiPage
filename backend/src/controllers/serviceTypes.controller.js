const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * @desc    Obtener tipos de servicio activos (público)
 * @route   GET /api/service-types
 * @access  Public
 */
exports.getActiveServiceTypes = async (req, res) => {
  try {
    const types = await prisma.serviceType.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
      select: {
        id: true,
        name: true,
        label: true,
        description: true,
        icon: true,
        color: true,
        order: true,
      },
    });

    res.json({
      success: true,
      count: types.length,
      data: types,
    });
  } catch (error) {
    console.error('Error fetching service types:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener tipos de servicio',
      message: error.message,
    });
  }
};

/**
 * @desc    Obtener todos los tipos de servicio (admin)
 * @route   GET /api/admin/service-types
 * @access  Private/Admin
 */
exports.getAllServiceTypes = async (req, res) => {
  try {
    const types = await prisma.serviceType.findMany({
      orderBy: { order: 'asc' },
    });

    res.json({
      success: true,
      count: types.length,
      data: types,
    });
  } catch (error) {
    console.error('Error fetching service types:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener tipos de servicio',
      message: error.message,
    });
  }
};

/**
 * @desc    Crear nuevo tipo de servicio
 * @route   POST /api/admin/service-types
 * @access  Private/Admin
 */
exports.createServiceType = async (req, res) => {
  try {
    const { name, label, description, icon, color, order, isActive } = req.body;

    // Validar campos requeridos
    if (!name || !label) {
      return res.status(400).json({
        success: false,
        error: 'Los campos name y label son requeridos',
      });
    }

    // Verificar que el nombre no exista
    const existingType = await prisma.serviceType.findUnique({
      where: { name },
    });

    if (existingType) {
      return res.status(400).json({
        success: false,
        error: 'Ya existe un tipo de servicio con ese nombre',
      });
    }

    // Crear tipo de servicio
    const type = await prisma.serviceType.create({
      data: {
        name,
        label,
        description,
        icon,
        color,
        order: order || 0,
        isActive: isActive !== undefined ? isActive : true,
      },
    });

    res.status(201).json({
      success: true,
      data: type,
      message: 'Tipo de servicio creado exitosamente',
    });
  } catch (error) {
    console.error('Error creating service type:', error);
    res.status(500).json({
      success: false,
      error: 'Error al crear tipo de servicio',
      message: error.message,
    });
  }
};

/**
 * @desc    Actualizar tipo de servicio
 * @route   PATCH /api/admin/service-types/:id
 * @access  Private/Admin
 */
exports.updateServiceType = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar que el tipo existe
    const existingType = await prisma.serviceType.findUnique({
      where: { id },
    });

    if (!existingType) {
      return res.status(404).json({
        success: false,
        error: 'Tipo de servicio no encontrado',
      });
    }

    // Si se intenta cambiar el name, verificar que no exista otro con ese nombre
    if (req.body.name && req.body.name !== existingType.name) {
      const duplicateType = await prisma.serviceType.findUnique({
        where: { name: req.body.name },
      });

      if (duplicateType) {
        return res.status(400).json({
          success: false,
          error: 'Ya existe un tipo de servicio con ese nombre',
        });
      }
    }

    // Actualizar el tipo
    const type = await prisma.serviceType.update({
      where: { id },
      data: req.body,
    });

    res.json({
      success: true,
      data: type,
      message: 'Tipo de servicio actualizado exitosamente',
    });
  } catch (error) {
    console.error('Error updating service type:', error);
    res.status(500).json({
      success: false,
      error: 'Error al actualizar tipo de servicio',
      message: error.message,
    });
  }
};

/**
 * @desc    Eliminar tipo de servicio
 * @route   DELETE /api/admin/service-types/:id
 * @access  Private/Admin
 */
exports.deleteServiceType = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar que el tipo existe
    const existingType = await prisma.serviceType.findUnique({
      where: { id },
    });

    if (!existingType) {
      return res.status(404).json({
        success: false,
        error: 'Tipo de servicio no encontrado',
      });
    }

    // Verificar si hay servicios usando este tipo
    // Nota: Esta verificación depende de cómo uses ServiceType en tu schema
    // Si tienes una relación directa, deberías verificarla aquí

    // Eliminar el tipo
    await prisma.serviceType.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: 'Tipo de servicio eliminado exitosamente',
    });
  } catch (error) {
    console.error('Error deleting service type:', error);
    res.status(500).json({
      success: false,
      error: 'Error al eliminar tipo de servicio',
      message: error.message,
    });
  }
};

/**
 * @desc    Reordenar tipos de servicio
 * @route   PATCH /api/admin/service-types/reorder
 * @access  Private/Admin
 */
exports.reorderServiceTypes = async (req, res) => {
  try {
    const { typeOrders } = req.body;

    if (!Array.isArray(typeOrders) || typeOrders.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Se requiere un array de typeOrders con formato [{ id, order }, ...]',
      });
    }

    // Actualizar el orden de cada tipo
    const updatePromises = typeOrders.map(({ id, order }) =>
      prisma.serviceType.update({
        where: { id },
        data: { order },
      })
    );

    await Promise.all(updatePromises);

    res.json({
      success: true,
      message: 'Tipos de servicio reordenados exitosamente',
    });
  } catch (error) {
    console.error('Error reordering service types:', error);
    res.status(500).json({
      success: false,
      error: 'Error al reordenar tipos de servicio',
      message: error.message,
    });
  }
};
