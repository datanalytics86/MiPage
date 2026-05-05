/**
 * Sistema de logging profesional
 */

const LOG_LEVELS = {
  ERROR: 'ERROR',
  WARN: 'WARN',
  INFO: 'INFO',
  DEBUG: 'DEBUG',
};

const COLORS = {
  ERROR: '\x1b[31m', // Red
  WARN: '\x1b[33m',  // Yellow
  INFO: '\x1b[36m',  // Cyan
  DEBUG: '\x1b[35m', // Magenta
  RESET: '\x1b[0m',
};

class Logger {
  constructor(context = 'App') {
    this.context = context;
    this.logLevel = process.env.LOG_LEVEL || 'INFO';
  }

  formatMessage(level, message, meta = {}) {
    const timestamp = new Date().toISOString();
    const contextStr = `[${this.context}]`;
    const metaStr = Object.keys(meta).length > 0 ? JSON.stringify(meta) : '';

    return `${timestamp} ${level} ${contextStr} ${message} ${metaStr}`.trim();
  }

  shouldLog(level) {
    const levels = Object.keys(LOG_LEVELS);
    const currentLevelIndex = levels.indexOf(this.logLevel);
    const messageLevelIndex = levels.indexOf(level);

    return messageLevelIndex <= currentLevelIndex;
  }

  log(level, message, meta = {}) {
    if (!this.shouldLog(level)) return;

    const formattedMessage = this.formatMessage(level, message, meta);
    const color = COLORS[level] || COLORS.RESET;

    // En desarrollo, usar colores
    if (process.env.NODE_ENV === 'development') {
      console.log(`${color}${formattedMessage}${COLORS.RESET}`);
    } else {
      // En producción, formato JSON para parsing
      console.log(JSON.stringify({
        timestamp: new Date().toISOString(),
        level,
        context: this.context,
        message,
        ...meta,
      }));
    }

    // En producción, enviar a servicio de logging
    // (Sentry, LogRocket, CloudWatch, etc.)
    if (process.env.NODE_ENV === 'production' && level === 'ERROR') {
      this.sendToErrorTracking({ level, message, meta });
    }
  }

  sendToErrorTracking(err, meta) {
    try {
      const { captureException } = require('./sentry');
      captureException(err instanceof Error ? err : new Error(String(err)), meta);
    } catch (_) {
      // sentry module not loaded yet, skip
    }
  }

  error(message, meta = {}) {
    this.log(LOG_LEVELS.ERROR, message, meta);
  }

  warn(message, meta = {}) {
    this.log(LOG_LEVELS.WARN, message, meta);
  }

  info(message, meta = {}) {
    this.log(LOG_LEVELS.INFO, message, meta);
  }

  debug(message, meta = {}) {
    this.log(LOG_LEVELS.DEBUG, message, meta);
  }

  // Logging específico para requests HTTP
  request(req, res, duration) {
    const meta = {
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get('user-agent'),
    };

    if (res.statusCode >= 500) {
      this.error('HTTP Request Failed', meta);
    } else if (res.statusCode >= 400) {
      this.warn('HTTP Request Warning', meta);
    } else {
      this.info('HTTP Request', meta);
    }
  }

  // Logging para operaciones de base de datos
  database(operation, duration, query = null) {
    const meta = {
      operation,
      duration: `${duration}ms`,
      ...(query && { query }),
    };

    if (duration > 1000) {
      this.warn('Slow database query', meta);
    } else {
      this.debug('Database operation', meta);
    }
  }
}

// Crear instancias para diferentes contextos
const createLogger = (context) => new Logger(context);

// Logger por defecto
const logger = new Logger();

module.exports = {
  logger,
  createLogger,
  LOG_LEVELS,
};
