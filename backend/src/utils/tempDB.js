// Base de datos temporal JSON (reemplazo temporal de Prisma)
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '../../temp-db.json');

// Leer base de datos
const readDB = () => {
  try {
    const data = fs.readFileSync(dbPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error leyendo DB temporal:', error);
    return { users: [], services: [], reviews: [], posts: [], favorites: [], notifications: [], serviceTypes: [] };
  }
};

// Escribir base de datos
const writeDB = (data) => {
  try {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error escribiendo DB temporal:', error);
  }
};

// Simular Prisma Client
class TempPrismaClient {
  constructor() {
    this.user = {
      findUnique: async ({ where }) => {
        const db = readDB();
        if (where.email) {
          return db.users.find(u => u.email === where.email) || null;
        }
        if (where.id) {
          return db.users.find(u => u.id === where.id) || null;
        }
        return null;
      },
      findMany: async ({ where, orderBy, take, skip }) => {
        const db = readDB();
        let users = db.users;

        if (where) {
          if (where.role) users = users.filter(u => u.role === where.role);
          if (where.isActive !== undefined) users = users.filter(u => u.isActive === where.isActive);
        }

        if (orderBy && orderBy.createdAt) {
          users = users.sort((a, b) => {
            if (orderBy.createdAt === 'desc') {
              return new Date(b.createdAt) - new Date(a.createdAt);
            }
            return new Date(a.createdAt) - new Date(b.createdAt);
          });
        }

        if (skip) users = users.slice(skip);
        if (take) users = users.slice(0, take);

        return users;
      },
      create: async ({ data, select }) => {
        const db = readDB();
        const newUser = {
          id: `user-${Date.now()}`,
          ...data,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        db.users.push(newUser);
        writeDB(db);

        if (select) {
          const result = {};
          Object.keys(select).forEach(key => {
            if (select[key] && newUser[key] !== undefined) {
              result[key] = newUser[key];
            }
          });
          return result;
        }
        return newUser;
      },
      update: async ({ where, data }) => {
        const db = readDB();
        const index = db.users.findIndex(u => u.id === where.id || u.email === where.email);
        if (index === -1) throw new Error('Usuario no encontrado');

        db.users[index] = {
          ...db.users[index],
          ...data,
          updatedAt: new Date().toISOString(),
        };
        writeDB(db);
        return db.users[index];
      },
      delete: async ({ where }) => {
        const db = readDB();
        const index = db.users.findIndex(u => u.id === where.id);
        if (index === -1) throw new Error('Usuario no encontrado');

        const deleted = db.users.splice(index, 1)[0];
        writeDB(db);
        return deleted;
      },
      count: async ({ where }) => {
        const db = readDB();
        let users = db.users;

        if (where) {
          if (where.role) users = users.filter(u => u.role === where.role);
        }

        return users.length;
      },
    };

    this.service = {
      findMany: async ({ where, include, orderBy, take }) => {
        const db = readDB();
        let services = db.services;

        if (where) {
          if (where.userId) services = services.filter(s => s.userId === where.userId);
          if (where.status) services = services.filter(s => s.status === where.status);
        }

        if (orderBy && orderBy.createdAt) {
          services = services.sort((a, b) => {
            if (orderBy.createdAt === 'desc') {
              return new Date(b.createdAt) - new Date(a.createdAt);
            }
            return new Date(a.createdAt) - new Date(b.createdAt);
          });
        }

        if (take) services = services.slice(0, take);

        return services;
      },
      findUnique: async ({ where }) => {
        const db = readDB();
        return db.services.find(s => s.id === where.id) || null;
      },
      create: async ({ data }) => {
        const db = readDB();
        const newService = {
          id: `service-${Date.now()}`,
          ...data,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        db.services.push(newService);
        writeDB(db);
        return newService;
      },
      update: async ({ where, data }) => {
        const db = readDB();
        const index = db.services.findIndex(s => s.id === where.id);
        if (index === -1) throw new Error('Servicio no encontrado');

        db.services[index] = {
          ...db.services[index],
          ...data,
          updatedAt: new Date().toISOString(),
        };
        writeDB(db);
        return db.services[index];
      },
      delete: async ({ where }) => {
        const db = readDB();
        const index = db.services.findIndex(s => s.id === where.id);
        if (index === -1) throw new Error('Servicio no encontrado');

        const deleted = db.services.splice(index, 1)[0];
        writeDB(db);
        return deleted;
      },
      count: async ({ where }) => {
        const db = readDB();
        let services = db.services;

        if (where && where.status) {
          services = services.filter(s => s.status === where.status);
        }

        return services.length;
      },
    };

    this.post = {
      findMany: async ({ where, orderBy, take }) => {
        const db = readDB();
        let posts = db.posts;

        if (where && where.userId) {
          posts = posts.filter(p => p.userId === where.userId);
        }

        if (orderBy && orderBy.createdAt) {
          posts = posts.sort((a, b) => {
            if (orderBy.createdAt === 'desc') {
              return new Date(b.createdAt) - new Date(a.createdAt);
            }
            return new Date(a.createdAt) - new Date(b.createdAt);
          });
        }

        if (take) posts = posts.slice(0, take);

        return posts;
      },
      create: async ({ data }) => {
        const db = readDB();
        const newPost = {
          id: `post-${Date.now()}`,
          ...data,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        db.posts.push(newPost);
        writeDB(db);
        return newPost;
      },
      delete: async ({ where }) => {
        const db = readDB();
        const index = db.posts.findIndex(p => p.id === where.id);
        if (index === -1) throw new Error('Post no encontrado');

        const deleted = db.posts.splice(index, 1)[0];
        writeDB(db);
        return deleted;
      },
    };

    this.serviceType = {
      findMany: async ({ where, orderBy }) => {
        const db = readDB();
        let types = db.serviceTypes;

        if (where && where.isActive !== undefined) {
          types = types.filter(t => t.isActive === where.isActive);
        }

        if (orderBy && orderBy.order) {
          types = types.sort((a, b) => a.order - b.order);
        }

        return types;
      },
    };
  }

  async $disconnect() {
    // No-op para compatibilidad
  }
}

module.exports = { TempPrismaClient };
