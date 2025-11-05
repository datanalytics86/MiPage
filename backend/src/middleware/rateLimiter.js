const rateLimit = require('express-rate-limit');

// Rate limiter general
const rateLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutos
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: {
    error: 'Demasiadas peticiones desde esta IP, por favor intenta más tarde',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter estricto para autenticación
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // 5 intentos
  skipSuccessfulRequests: true,
  message: {
    error: 'Demasiados intentos de inicio de sesión, intenta de nuevo en 15 minutos',
  },
});

// Rate limiter para uploads
const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 20, // 20 uploads por hora
  message: {
    error: 'Demasiadas subidas de archivos, intenta más tarde',
  },
});

module.exports = {
  rateLimiter,
  authLimiter,
  uploadLimiter,
};
