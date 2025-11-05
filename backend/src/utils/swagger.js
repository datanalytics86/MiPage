const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'MiPage API',
      version: '1.0.0',
      description: 'API para marketplace de servicios profesionales',
      contact: {
        name: 'MiPage',
        email: 'soporte@mipage.cl',
      },
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 3001}`,
        description: 'Servidor de desarrollo',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./src/routes/*.js'], // Ruta a los archivos de rutas
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
