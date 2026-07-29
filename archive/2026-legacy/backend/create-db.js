// Script temporal para crear base de datos SQLite sin Prisma
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

// Crear archivo de datos JSON temporal
const dbPath = path.join(__dirname, 'temp-db.json');

async function createTempDB() {
  const hashedPassword = await bcrypt.hash('password123', 10);
  
  const db = {
    users: [
      {
        id: 'admin-001',
        email: 'admin@mipage.cl',
        password: hashedPassword,
        name: 'Administrador',
        role: 'ADMIN',
        isVerified: true,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
        isActive: true,
        approvalStatus: 'ACTIVE',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'publisher-001',
        email: 'maria@example.com',
        password: hashedPassword,
        name: 'María González',
        role: 'PUBLISHER',
        isVerified: true,
        bio: 'Modelo profesional con 5 años de experiencia',
        phone: '+56912345678',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=maria',
        isActive: true,
        approvalStatus: 'ACTIVE',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'user-001',
        email: 'juan@example.com',
        password: hashedPassword,
        name: 'Juan Pérez',
        role: 'USER',
        isVerified: true,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=juan',
        isActive: true,
        approvalStatus: 'ACTIVE',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ],
    services: [],
    reviews: [],
    posts: [],
    favorites: [],
    notifications: [],
    serviceTypes: [
      {
        id: 'type-001',
        name: 'MODELAJE',
        label: 'Modelaje',
        description: 'Servicios de modelaje profesional',
        icon: '📸',
        color: '#EC4899',
        order: 1,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'type-002',
        name: 'MASAJES',
        label: 'Masajes',
        description: 'Masajes terapéuticos y relajantes',
        icon: '💆',
        color: '#FF6B35',
        order: 2,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ],
  };

  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
  console.log('✅ Base de datos temporal creada en:', dbPath);
  console.log('');
  console.log('Credenciales disponibles:');
  console.log('  Admin: admin@mipage.cl / password123');
  console.log('  Publisher: maria@example.com / password123');
  console.log('  User: juan@example.com / password123');
}

createTempDB().catch(console.error);
