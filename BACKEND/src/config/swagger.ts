import swaggerJsdoc from 'swagger-jsdoc';
import config from './index';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'BookMyDoctor API Documentation',
      version: '1.0.0',
      description: `API documentation for the BookMyDoctor healthcare platform.\n\n` +
                   `**Backend URL:** http://localhost:${config.PORT}\n` +
                   `**API Base Path:** http://localhost:${config.PORT}/api/v1`,
    },
    servers: [
      {
        url: `http://localhost:${config.PORT}/api/v1`,
        description: 'Development server',
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
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            email: { type: 'string' },
            role: { type: 'string', enum: ['patient', 'doctor', 'admin'] },
            phone: { type: 'string' },
            avatar: { type: 'string' },
            isEmailVerified: { type: 'boolean' },
          },
        },
        Doctor: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            user: { $ref: '#/components/schemas/User' },
            specialty: { type: 'string' },
            experience: { type: 'number' },
            qualifications: { type: 'array', items: { type: 'string' } },
            bio: { type: 'string' },
            consultationFee: { type: 'number' },
            rating: { type: 'number' },
            numReviews: { type: 'number' },
          },
        },
        Clinic: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            address: { type: 'string' },
            phone: { type: 'string' },
            images: { type: 'array', items: { type: 'string' } },
            owner: { type: 'string' },
          },
        },
        Appointment: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            patient: { type: 'string' },
            doctor: { type: 'string' },
            clinic: { type: 'string' },
            date: { type: 'string', format: 'date-time' },
            slot: { type: 'string' },
            status: { type: 'string', enum: ['pending', 'confirmed', 'cancelled', 'completed'] },
            reason: { type: 'string' },
            paymentStatus: { type: 'string', enum: ['pending', 'paid', 'failed'] },
          },
        },
      },
    },
  },
  apis: ['./src/routes/*.ts'], // Path to the API docs
};

export const swaggerSpec = swaggerJsdoc(options);
