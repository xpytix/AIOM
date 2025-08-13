const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'AIOM Project API',
      version: '1.0.0',
      description: 'Interaktywna dokumentacja API dla projektu AIOM',
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Serwer deweloperski',
      },
    ],
    // Definiujemy tylko tag, którego aktualnie używamy
    tags: [
        {
            name: 'Maps',
            description: 'API do zarządzania mapami'
        }
    ],
    // Definiujemy tylko schemat, którego aktualnie używamy
    components: {
      schemas: {
        Map: {
          type: 'object',
          required: ['name'],
          properties: {
            _id: { type: 'string', description: 'Automatycznie generowane ID mapy' },
            name: { type: 'string', description: 'Nazwa mapy' },
            description: { type: 'string', description: 'Opcjonalny opis mapy' },
            imageUrl: { type: 'string', description: 'Link do obrazu tła mapy' },
            points: { type: 'array', items: { type: 'string' }, description: 'Lista ID punktów należących do tej mapy' },
            walks3D: { type: 'array', items: { type: 'string' }, description: 'Lista ID spacerów 3D należących do tej mapy' },
          },
          example: {
            name: "Magazyn Główny",
            description: "Plan parteru magazynu z punktami kontrolnymi.",
            imageUrl: "/maps/warehouse_floor_1.png"
          }
        }
      }
    }
  },
  // Skupiamy się TYLKO na jednym pliku do testów
  apis: ['./routes/maps.js'],
};

const specs = swaggerJsdoc(options);
module.exports = specs;
