const swaggerJsDoc = require("swagger-jsdoc");

const options = {
  swaggerDefinition: {
    openapi: "3.1.0",
    info: {
      title: "TRF API Swagger Documentation.",
      version: "1.0.0",
      description:
        "Swagger documentation for TRF (Thulisha Reddy Foundation) REST-API",
    },
    servers: [
      {
        url: "http://localhost:54321",
        description: "Development Server",
      },
    ],
  },
  apis: ["./src/routes/*.js"],
};

const specs = swaggerJsDoc(options);

module.exports = specs;
