// Temporal: Usar JSON en lugar de Prisma por problemas de binarios
const { TempPrismaClient } = require('../utils/tempDB');
const ExcelJS = require('exceljs');
const crypto = require('crypto');

const prisma = new TempPrismaClient();

/**
 * @desc    Obtener usuarios con metadata (tipo tabla Excel)
 * @route   GET /api/admin/users/with-metadata
 * @access  Private/Admin
 */
exports.getUsersWithMetadata = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      role,
      isActive,
      tipoServicio,
      ciudad,
      approvalStatus,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Construir filtros
    const where = {
      role: role || { not: 'ADMIN' }, // No mostrar admins por defecto
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { metadata: { rut: { contains: search } } },
      ];
    }

    if (isActive !== undefined) {
      where.isActive = isActive === 'true';
    }

    if (approvalStatus) {
      where.approvalStatus = approvalStatus;
    }

    // Filtros de metadata
    if (tipoServicio || ciudad) {
      where.metadata = {};
      if (tipoServicio) where.metadata.tipoServicio = tipoServicio;
      if (ciudad) where.metadata.ciudad = { contains: ciudad, mode: 'insensitive' };
    }

    // Consulta con paginación
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: parseInt(limit),
        include: {
          metadata: {
            include: {
              customValues: {
                include: {
                  field: {
                    select: {
                      fieldName: true,
                      fieldLabel: true,
                      fieldType: true,
                    },
                  },
                },
              },
            },
          },
          services: {
            select: {
              id: true,
              title: true,
              status: true,
              category: true,
            },
          },
          _count: {
            select: {
              services: true,
              reviews: true,
            },
          },
        },
        orderBy: { [sortBy]: sortOrder },
      }),
      prisma.user.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / parseInt(limit)),
          hasMore: skip + users.length < total,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener usuarios',
      message: error.message,
    });
  }
};

/**
 * @desc    Obtener usuario completo con toda su metadata
 * @route   GET /api/admin/users/:id/full
 * @access  Private/Admin
 */
exports.getUserFull = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        metadata: {
          include: {
            customValues: {
              include: {
                field: true,
              },
            },
          },
        },
        services: {
          include: {
            reviews: {
              select: {
                id: true,
                rating: true,
                comment: true,
                createdAt: true,
              },
            },
            _count: {
              select: {
                reviews: true,
              },
            },
          },
        },
        reviews: {
          include: {
            service: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        },
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
        success: false,
        error: 'Usuario no encontrado',
      });
    }

    // No enviar el password
    const { password, ...userWithoutPassword } = user;

    res.json({
      success: true,
      data: userWithoutPassword,
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener usuario',
      message: error.message,
    });
  }
};

/**
 * @desc    Activar/Desactivar anuncio de usuario
 * @route   PATCH /api/admin/users/:id/toggle-active
 * @access  Private/Admin
 */
exports.toggleUserActive = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        isActive: true,
        approvalStatus: true,
        role: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Usuario no encontrado',
      });
    }

    // Solo publishers pueden tener anuncios activos/inactivos
    if (user.role !== 'PUBLISHER') {
      return res.status(400).json({
        success: false,
        error: 'Solo los publishers pueden tener anuncios activos',
      });
    }

    // Solo se puede activar si está REGISTERED o ya está ACTIVE/INACTIVE
    if (user.approvalStatus !== 'REGISTERED' &&
        user.approvalStatus !== 'ACTIVE' &&
        user.approvalStatus !== 'INACTIVE') {
      return res.status(400).json({
        success: false,
        error: 'El usuario debe completar el registro antes de activar su anuncio',
      });
    }

    const newActiveState = !user.isActive;
    const newApprovalStatus = newActiveState ? 'ACTIVE' : 'INACTIVE';

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        isActive: newActiveState,
        approvalStatus: newApprovalStatus,
      },
      select: {
        id: true,
        name: true,
        email: true,
        isActive: true,
        approvalStatus: true,
      },
    });

    res.json({
      success: true,
      data: updatedUser,
      message: `Usuario ${newActiveState ? 'activado' : 'desactivado'} exitosamente`,
    });
  } catch (error) {
    console.error('Error toggling user active:', error);
    res.status(500).json({
      success: false,
      error: 'Error al cambiar estado del usuario',
      message: error.message,
    });
  }
};

/**
 * @desc    Generar token de invitación para nuevo usuario
 * @route   POST /api/admin/users/invite
 * @access  Private/Admin
 */
exports.inviteUser = async (req, res) => {
  try {
    const { email, name } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'El email es requerido',
      });
    }

    // Verificar si el email ya existe
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'El email ya está registrado',
      });
    }

    // Generar token único
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // Expira en 7 días

    // Crear usuario pendiente
    const user = await prisma.user.create({
      data: {
        email,
        name: name || '',
        password: '', // Sin password aún
        role: 'PUBLISHER',
        approvalStatus: 'APPROVED',
        registrationToken: token,
        tokenExpiresAt: expiresAt,
      },
      select: {
        id: true,
        email: true,
        name: true,
        registrationToken: true,
        tokenExpiresAt: true,
      },
    });

    // Construir link de registro
    const registrationLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/register/${token}`;

    res.status(201).json({
      success: true,
      data: {
        user,
        registrationLink,
      },
      message: 'Invitación creada exitosamente',
    });

    // TODO: Enviar email con el link de registro
  } catch (error) {
    console.error('Error inviting user:', error);
    res.status(500).json({
      success: false,
      error: 'Error al crear invitación',
      message: error.message,
    });
  }
};

/**
 * @desc    Exportar usuarios a Excel
 * @route   GET /api/admin/users/export
 * @access  Private/Admin
 */
exports.exportToExcel = async (req, res) => {
  try {
    // Obtener todos los usuarios con metadata
    const users = await prisma.user.findMany({
      where: {
        role: { not: 'ADMIN' },
      },
      include: {
        metadata: {
          include: {
            customValues: {
              include: {
                field: true,
              },
            },
          },
        },
        _count: {
          select: {
            services: true,
            reviews: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Crear workbook
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Usuarios MiPage');

    // Definir columnas
    worksheet.columns = [
      { header: 'ID', key: 'id', width: 35 },
      { header: 'Nombre', key: 'name', width: 25 },
      { header: 'Email', key: 'email', width: 35 },
      { header: 'Teléfono', key: 'phone', width: 15 },
      { header: 'Rol', key: 'role', width: 12 },
      { header: 'Estado Anuncio', key: 'isActive', width: 15 },
      { header: 'Estado Aprobación', key: 'approvalStatus', width: 18 },
      { header: 'RUT', key: 'rut', width: 15 },
      { header: 'Edad', key: 'edad', width: 8 },
      { header: 'Nacionalidad', key: 'nacionalidad', width: 15 },
      { header: 'Altura (cm)', key: 'altura', width: 12 },
      { header: 'Peso (kg)', key: 'peso', width: 12 },
      { header: 'Contextura', key: 'contextura', width: 15 },
      { header: 'Medidas', key: 'medidas', width: 15 },
      { header: 'Región', key: 'region', width: 25 },
      { header: 'Ciudad', key: 'ciudad', width: 20 },
      { header: 'Comuna', key: 'comuna', width: 20 },
      { header: 'Tipo Servicio', key: 'tipoServicio', width: 25 },
      { header: '# Servicios', key: 'serviceCount', width: 12 },
      { header: '# Reseñas', key: 'reviewCount', width: 12 },
      { header: 'Fecha Registro', key: 'createdAt', width: 20 },
    ];

    // Agregar datos
    users.forEach(user => {
      const row = {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        role: user.role,
        isActive: user.isActive ? 'Activo' : 'Inactivo',
        approvalStatus: user.approvalStatus,
        rut: user.metadata?.rut || '',
        edad: user.metadata?.edad || '',
        nacionalidad: user.metadata?.nacionalidad || '',
        altura: user.metadata?.altura || '',
        peso: user.metadata?.peso || '',
        contextura: user.metadata?.contextura || '',
        medidas: user.metadata?.medidas || '',
        region: user.metadata?.region || '',
        ciudad: user.metadata?.ciudad || '',
        comuna: user.metadata?.comuna || '',
        tipoServicio: user.metadata?.tipoServicio || '',
        serviceCount: user._count.services,
        reviewCount: user._count.reviews,
        createdAt: user.createdAt.toISOString().split('T')[0],
      };

      worksheet.addRow(row);
    });

    // Estilo del header
    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF0284c7' },
    };
    worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };

    // Agregar bordes a todas las celdas
    worksheet.eachRow((row, rowNumber) => {
      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        };
      });
    });

    // Generar buffer
    const buffer = await workbook.xlsx.writeBuffer();

    // Enviar archivo
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=usuarios-mipage-${Date.now()}.xlsx`
    );
    res.send(buffer);
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    res.status(500).json({
      success: false,
      error: 'Error al exportar a Excel',
      message: error.message,
    });
  }
};

/**
 * @desc    Actualizar metadata de usuario
 * @route   PATCH /api/admin/users/:id/metadata
 * @access  Private/Admin
 */
exports.updateUserMetadata = async (req, res) => {
  try {
    const { id } = req.params;
    const { fixedFields, customFields } = req.body;

    // Verificar que el usuario existe
    const user = await prisma.user.findUnique({
      where: { id },
      include: { metadata: true },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Usuario no encontrado',
      });
    }

    // Actualizar o crear metadata
    let metadata;
    if (user.metadata) {
      // Actualizar metadata existente
      metadata = await prisma.userMetadata.update({
        where: { userId: id },
        data: fixedFields,
      });
    } else {
      // Crear nueva metadata
      metadata = await prisma.userMetadata.create({
        data: {
          userId: id,
          ...fixedFields,
        },
      });
    }

    // Actualizar campos custom si se proporcionan
    if (customFields && Object.keys(customFields).length > 0) {
      const updatePromises = Object.entries(customFields).map(([fieldId, value]) =>
        prisma.customFieldValue.upsert({
          where: {
            metadataId_fieldId: {
              metadataId: metadata.id,
              fieldId: fieldId,
            },
          },
          update: { value: String(value) },
          create: {
            metadataId: metadata.id,
            fieldId: fieldId,
            value: String(value),
          },
        })
      );

      await Promise.all(updatePromises);
    }

    // Obtener metadata actualizada
    const updatedMetadata = await prisma.userMetadata.findUnique({
      where: { id: metadata.id },
      include: {
        customValues: {
          include: {
            field: true,
          },
        },
      },
    });

    res.json({
      success: true,
      data: updatedMetadata,
      message: 'Metadata actualizada exitosamente',
    });
  } catch (error) {
    console.error('Error updating metadata:', error);
    res.status(500).json({
      success: false,
      error: 'Error al actualizar metadata',
      message: error.message,
    });
  }
};
