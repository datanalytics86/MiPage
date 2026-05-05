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
    return { users: [], services: [], reviews: [], posts: [], favorites: [], notifications: [], serviceTypes: [], auditLogs: [] };
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

    this.review = {
      findMany: async ({ where, include, orderBy, take }) => {
        const db = readDB();
        let reviews = db.reviews || [];

        if (where) {
          if (where.serviceId) reviews = reviews.filter(r => r.serviceId === where.serviceId);
          if (where.userId) reviews = reviews.filter(r => r.userId === where.userId);
        }

        if (orderBy && orderBy.createdAt) {
          reviews = reviews.sort((a, b) => {
            if (orderBy.createdAt === 'desc') {
              return new Date(b.createdAt) - new Date(a.createdAt);
            }
            return new Date(a.createdAt) - new Date(b.createdAt);
          });
        }

        if (take) reviews = reviews.slice(0, take);

        // Agregar información del usuario si se solicita include
        if (include && include.user) {
          reviews = reviews.map(review => {
            const user = db.users.find(u => u.id === review.userId);
            return {
              ...review,
              user: user ? { id: user.id, name: user.name, avatar: user.avatar } : null,
            };
          });
        }

        return reviews;
      },
      findUnique: async ({ where }) => {
        const db = readDB();
        if (where.id) {
          return (db.reviews || []).find(r => r.id === where.id) || null;
        }
        // Buscar por combinación única
        if (where.serviceId_userId) {
          return (db.reviews || []).find(
            r => r.serviceId === where.serviceId_userId.serviceId &&
                 r.userId === where.serviceId_userId.userId
          ) || null;
        }
        return null;
      },
      findFirst: async ({ where }) => {
        const db = readDB();
        let reviews = db.reviews || [];
        if (where) {
          if (where.serviceId) reviews = reviews.filter(r => r.serviceId === where.serviceId);
          if (where.userId) reviews = reviews.filter(r => r.userId === where.userId);
        }
        return reviews[0] || null;
      },
      create: async ({ data }) => {
        const db = readDB();
        if (!db.reviews) db.reviews = [];
        const newReview = {
          id: `review-${Date.now()}`,
          ...data,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        db.reviews.push(newReview);
        writeDB(db);
        return newReview;
      },
      update: async ({ where, data }) => {
        const db = readDB();
        if (!db.reviews) db.reviews = [];
        const index = db.reviews.findIndex(r => r.id === where.id);
        if (index === -1) throw new Error('Reseña no encontrada');

        db.reviews[index] = {
          ...db.reviews[index],
          ...data,
          updatedAt: new Date().toISOString(),
        };
        writeDB(db);
        return db.reviews[index];
      },
      delete: async ({ where }) => {
        const db = readDB();
        if (!db.reviews) db.reviews = [];
        const index = db.reviews.findIndex(r => r.id === where.id);
        if (index === -1) throw new Error('Reseña no encontrada');

        const deleted = db.reviews.splice(index, 1)[0];
        writeDB(db);
        return deleted;
      },
      count: async ({ where }) => {
        const db = readDB();
        let reviews = db.reviews || [];
        if (where) {
          if (where.serviceId) reviews = reviews.filter(r => r.serviceId === where.serviceId);
          if (where.userId) reviews = reviews.filter(r => r.userId === where.userId);
        }
        return reviews.length;
      },
      aggregate: async ({ where, _avg }) => {
        const db = readDB();
        let reviews = db.reviews || [];

        if (where) {
          if (where.serviceId) reviews = reviews.filter(r => r.serviceId === where.serviceId);
          if (where.userId) reviews = reviews.filter(r => r.userId === where.userId);
        }

        const result = {};

        if (_avg && _avg.rating) {
          if (reviews.length === 0) {
            result._avg = { rating: null };
          } else {
            const sum = reviews.reduce((acc, r) => acc + (r.rating || 0), 0);
            result._avg = { rating: sum / reviews.length };
          }
        }

        return result;
      },
    };

    this.favorite = {
      findMany: async ({ where }) => {
        const db = readDB();
        let favorites = db.favorites || [];
        if (where) {
          if (where.userId) favorites = favorites.filter(f => f.userId === where.userId);
          if (where.serviceId) favorites = favorites.filter(f => f.serviceId === where.serviceId);
        }
        return favorites;
      },
      findUnique: async ({ where }) => {
        const db = readDB();
        if (where.userId_serviceId) {
          return (db.favorites || []).find(
            f => f.userId === where.userId_serviceId.userId &&
                 f.serviceId === where.userId_serviceId.serviceId
          ) || null;
        }
        return null;
      },
      create: async ({ data }) => {
        const db = readDB();
        if (!db.favorites) db.favorites = [];
        const newFavorite = {
          id: `fav-${Date.now()}`,
          ...data,
          createdAt: new Date().toISOString(),
        };
        db.favorites.push(newFavorite);
        writeDB(db);
        return newFavorite;
      },
      delete: async ({ where }) => {
        const db = readDB();
        if (!db.favorites) db.favorites = [];
        let index = -1;
        if (where.id) {
          index = db.favorites.findIndex(f => f.id === where.id);
        } else if (where.userId_serviceId) {
          index = db.favorites.findIndex(
            f => f.userId === where.userId_serviceId.userId &&
                 f.serviceId === where.userId_serviceId.serviceId
          );
        }
        if (index === -1) throw new Error('Favorito no encontrado');

        const deleted = db.favorites.splice(index, 1)[0];
        writeDB(db);
        return deleted;
      },
      count: async ({ where }) => {
        const db = readDB();
        let favorites = db.favorites || [];
        if (where) {
          if (where.serviceId) favorites = favorites.filter(f => f.serviceId === where.serviceId);
        }
        return favorites.length;
      },
    };

    this.notification = {
      findMany: async ({ where, orderBy, take }) => {
        const db = readDB();
        let notifications = db.notifications || [];
        if (where) {
          if (where.userId) notifications = notifications.filter(n => n.userId === where.userId);
          if (where.isRead !== undefined) notifications = notifications.filter(n => n.isRead === where.isRead);
        }
        if (orderBy && orderBy.createdAt) {
          notifications = notifications.sort((a, b) => {
            if (orderBy.createdAt === 'desc') {
              return new Date(b.createdAt) - new Date(a.createdAt);
            }
            return new Date(a.createdAt) - new Date(b.createdAt);
          });
        }
        if (take) notifications = notifications.slice(0, take);
        return notifications;
      },
      create: async ({ data }) => {
        const db = readDB();
        if (!db.notifications) db.notifications = [];
        const newNotification = {
          id: `notif-${Date.now()}`,
          ...data,
          createdAt: new Date().toISOString(),
        };
        db.notifications.push(newNotification);
        writeDB(db);
        return newNotification;
      },
      updateMany: async ({ where, data }) => {
        const db = readDB();
        if (!db.notifications) db.notifications = [];
        let count = 0;
        db.notifications = db.notifications.map(n => {
          if (where.userId && n.userId === where.userId) {
            count++;
            return { ...n, ...data };
          }
          return n;
        });
        writeDB(db);
        return { count };
      },
      count: async ({ where }) => {
        const db = readDB();
        let notifications = db.notifications || [];
        if (where) {
          if (where.userId) notifications = notifications.filter(n => n.userId === where.userId);
          if (where.isRead !== undefined) notifications = notifications.filter(n => n.isRead === where.isRead);
        }
        return notifications.length;
      },
    };

    this.serviceUpdate = {
      findMany: async ({ where, orderBy, take }) => {
        const db = readDB();
        let updates = db.serviceUpdates || [];
        if (where) {
          if (where.serviceId) updates = updates.filter(u => u.serviceId === where.serviceId);
          if (where.isActive !== undefined) updates = updates.filter(u => u.isActive === where.isActive);
        }
        if (orderBy) {
          if (orderBy.createdAt) {
            updates = updates.sort((a, b) => {
              if (orderBy.createdAt === 'desc') {
                return new Date(b.createdAt) - new Date(a.createdAt);
              }
              return new Date(a.createdAt) - new Date(b.createdAt);
            });
          }
        }
        if (take) updates = updates.slice(0, take);
        return updates;
      },
      create: async ({ data }) => {
        const db = readDB();
        if (!db.serviceUpdates) db.serviceUpdates = [];
        const newUpdate = {
          id: `update-${Date.now()}`,
          ...data,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        db.serviceUpdates.push(newUpdate);
        writeDB(db);
        return newUpdate;
      },
      delete: async ({ where }) => {
        const db = readDB();
        if (!db.serviceUpdates) db.serviceUpdates = [];
        const index = db.serviceUpdates.findIndex(u => u.id === where.id);
        if (index === -1) throw new Error('Actualización no encontrada');
        const deleted = db.serviceUpdates.splice(index, 1)[0];
        writeDB(db);
        return deleted;
      },
    };
  }

  async $disconnect() {
    // No-op para compatibilidad
  }

  // ─── AuditLog ────────────────────────────────────────────────
  get auditLog() {
    return {
      create: async ({ data }) => {
        const db = readDB();
        if (!db.auditLogs) db.auditLogs = [];
        const entry = { id: `audit-${Date.now()}`, ...data, createdAt: new Date().toISOString() };
        db.auditLogs.push(entry);
        writeDB(db);
        return entry;
      },
      findMany: async ({ where, orderBy, take } = {}) => {
        const db = readDB();
        let logs = db.auditLogs || [];
        if (where?.targetId) logs = logs.filter(l => l.targetId === where.targetId);
        if (where?.adminId) logs = logs.filter(l => l.adminId === where.adminId);
        if (orderBy?.createdAt === 'desc') logs = logs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        if (take) logs = logs.slice(0, take);
        return logs;
      },
    };
  }
}

module.exports = { TempPrismaClient };
