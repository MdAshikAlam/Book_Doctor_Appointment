import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import path from 'path';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger';
import { errorHandler } from './middlewares/error';
import logger from './utils/logger';
import { branchHandler } from './middlewares/branchHandler';

import authRoutes from './routes/auth.routes';
import doctorRoutes from './routes/doctor.routes';
import clinicRoutes from './routes/clinic.routes';
import appointmentRoutes from './routes/appointment.routes';
import userRoutes from './routes/user.routes';
import uploadRoutes from './routes/upload.routes';
import utilityRoutes from './routes/utility.routes';
import searchRoutes from './routes/search.routes';
import analyticsRoutes from './routes/analytics.routes';

const app = express();




// Security Middlewares
// Allow assets (e.g. uploaded profile images) to be embedded by frontend/dashboard on a different origin.
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:3000',
    process.env.DASHBOARD_URL || 'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3002'
  ],
  credentials: true,
}));
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());
app.use(branchHandler);
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Rate Limiting Disabled for debugging
// const limiter = rateLimit({ ... });
// app.use('/api', limiter);

// Swagger Documentation
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/doctors', doctorRoutes);
app.use('/api/v1/clinics', clinicRoutes);
app.use('/api/v1/appointments', appointmentRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/upload', uploadRoutes);
app.use('/api/v1/utility', utilityRoutes);
app.use('/api/v1/search', searchRoutes);
app.use('/api/v1/analytics', analyticsRoutes);

// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Basic route to check server
app.get('/', (req, res) => {
  res.send('BookMyDoctor API is running...');
});

// Error Handling
app.use(errorHandler);


export default app;
