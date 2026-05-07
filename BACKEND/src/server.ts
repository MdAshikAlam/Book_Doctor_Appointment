import mongoose from 'mongoose';
import app from './app';
import config from './config';
import logger from './utils/logger';

const PORT = config.PORT;

import { seedSystemUsers } from './utils/seed';

// Connect to MongoDB
mongoose
  .connect(config.MONGODB_URI)
  .then(async () => {
    logger.info('✅ Connected to MongoDB');

    // Seed system users
    await seedSystemUsers();

    app.listen(PORT, '0.0.0.0', () => {
      logger.info(`🚀 Server running in ${config.NODE_ENV} mode`);
      logger.info(`🔗 URL: http://0.0.0.0:${PORT}`);
      logger.info(`📝 Swagger Docs: http://localhost:${PORT}/docs`);
    });
  })
  .catch((err) => {
    logger.error({ err }, '❌ MongoDB connection error');
    process.exit(1);
  });

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: any) => {
  logger.error('UNHANDLED REJECTION! 💥 Shutting down...');
  logger.error(err.name, err.message);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err: any) => {
  logger.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  logger.error(err.name, err.message);
  process.exit(1);
});