const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * @desc    Obtener todos los campos de metadata (para admin)
 * @route   GET /api/admin/metadata-fields
 * @access  Private/Admin
 */
exports.getAllFields = async (req, res) => {
  try {
    const fields = await prisma.metadataField.findMany({
      orderBy: [
        { category: 'asc' },
        { order: 'asc' },
      ],
      include: {
        _count: {
          select: {
            values: true,
          },
        },
      },
    });

    res.json({
      success: true,
      count: fields.length,
      data: fields,
    });
  } catch (error) {
    console.error('Error fetching metadata fields:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener campos de metadata',
      message: error.message,
    });
  }
};

/**
 * @desc    Obtener campos activos de metadata (para formularios públicos)
 * @route   GET /api/metadata-fields/active
 * @access  Public
 */
exports.getActiveFields = async (req, res) => {
  try {
    const fields = await prisma.metadataField.findMany({
      where: { isActive: true },
      orderBy: [
        { category: 'asc' },
        { order: 'asc' },
      ],
      select: {
        id: true,
        fieldName: true,
        fieldLabel: true,
        fieldType: true,
        category: true,
        required: true,
        placeholder: true,
        helpText: true,
        options: true,
        minLength: true,
        maxLength: true,
        minValue: true,
        maxValue: true,
        pattern: true,
        order: true,
      },
    });

    res.json({
      success: true,
      count: fields.length,
      data: fields,
    });
  } catch (error) {
    console.error('Error fetching active fields:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener campos activos',
      message: error.message,
    });
  }
};

/**
 * @desc    Crear nuevo campo de metadata
 * @route   POST /api/admin/metadata-fields
 * @access  Private/Admin
 */
exports.createField = async (req, res) => {
  try {
    const {
      fieldName,
      fieldLabel,
      fieldType,
      category,
      required,
      placeholder,
      helpText,
      options,
      minLength,
      maxLength,
      minValue,
      maxValue,
      pattern,
      order,
      isActive,
      showInTable,
    } = req.body;

    // Validar que el fieldName no exista
    const existingField = await prisma.metadataField.findUnique({
      where: { fieldName },
    });

    if (existingField) {
      return res.status(400).json({
        success: false,
        error: 'Ya existe un campo con ese nombre',
      });
    }

    // Crear el campo
    const field = await prisma.metadataField.create({
      data: {
        fieldName,
        fieldLabel,
        fieldType,
        category,
        required: required || false,
        placeholder,
        helpText,
        options,
        minLength,
        maxLength,
        minValue,
        maxValue,
        pattern,
        order: order || 0,
        isActive: isActive !== undefined ? isActive : true,
        showInTable: showInTable !== undefined ? showInTable : true,
      },
    });

    res.status(201).json({
      success: true,
      data: field,
      message: 'Campo creado exitosamente',
    });
  } catch (error) {
    console.error('Error creating field:', error);
    res.status(500).json({
      success: false,
      error: 'Error al crear campo',
      message: error.message,
    });
  }
};

/**
 * @desc    Actualizar campo de metadata
 * @route   PATCH /api/admin/metadata-fields/:id
 * @access  Private/Admin
 */
exports.updateField = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar que el campo existe
    const existingField = await prisma.metadataField.findUnique({
      where: { id },
    });

    if (!existingField) {
      return res.status(404).json({
        success: false,
        error: 'Campo no encontrado',
      });
    }

    // Si se intenta cambiar el fieldName, verificar que no exista otro con ese nombre
    if (req.body.fieldName && req.body.fieldName !== existingField.fieldName) {
      const duplicateField = await prisma.metadataField.findUnique({
        where: { fieldName: req.body.fieldName },
      });

      if (duplicateField) {
        return res.status(400).json({
          success: false,
          error: 'Ya existe un campo con ese nombre',
        });
      }
    }

    // Actualizar el campo
    const field = await prisma.metadataField.update({
      where: { id },
      data: req.body,
    });

    res.json({
      success: true,
      data: field,
      message: 'Campo actualizado exitosamente',
    });
  } catch (error) {
    console.error('Error updating field:', error);
    res.status(500).json({
      success: false,
      error: 'Error al actualizar campo',
      message: error.message,
    });
  }
};

/**
 * @desc    Eliminar campo de metadata
 * @route   DELETE /api/admin/metadata-fields/:id
 * @access  Private/Admin
 */
exports.deleteField = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar que el campo existe
    const existingField = await prisma.metadataField.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            values: true,
          },
        },
      },
    });

    if (!existingField) {
      return res.status(404).json({
        success: false,
        error: 'Campo no encontrado',
      });
    }

    // Advertir si hay valores asociados
    if (existingField._count.values > 0) {
      return res.status(400).json({
        success: false,
        error: 'No se puede eliminar el campo porque tiene valores asociados',
        message: `Hay ${existingField._count.values} usuarios con valores en este campo`,
      });
    }

    // Eliminar el campo
    await prisma.metadataField.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: 'Campo eliminado exitosamente',
    });
  } catch (error) {
    console.error('Error deleting field:', error);
    res.status(500).json({
      success: false,
      error: 'Error al eliminar campo',
      message: error.message,
    });
  }
};

/**
 * @desc    Reordenar campos de metadata
 * @route   PATCH /api/admin/metadata-fields/reorder
 * @access  Private/Admin
 */
exports.reorderFields = async (req, res) => {
  try {
    const { fieldOrders } = req.body;

    if (!Array.isArray(fieldOrders) || fieldOrders.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Se requiere un array de fieldOrders con formato [{ id, order }, ...]',
      });
    }

    // Actualizar el orden de cada campo
    const updatePromises = fieldOrders.map(({ id, order }) =>
      prisma.metadataField.update({
        where: { id },
        data: { order },
      })
    );

    await Promise.all(updatePromises);

    res.json({
      success: true,
      message: 'Campos reordenados exitosamente',
    });
  } catch (error) {
    console.error('Error reordering fields:', error);
    res.status(500).json({
      success: false,
      error: 'Error al reordenar campos',
      message: error.message,
    });
  }
};
