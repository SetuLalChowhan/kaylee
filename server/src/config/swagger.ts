import swaggerJsdoc from "swagger-jsdoc";
import path from "path";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "PERN Auth API",
      version: "1.0.0",
      description: "Full-stack Authentication System API documentation",
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Development server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  },
  // Use path.join to ensure correct file resolution across environments
  apis: [path.join(process.cwd(), "src/docs/*.yaml")],
};

export const swaggerSpec = swaggerJsdoc(options);

