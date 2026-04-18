import mongoose from 'mongoose';
import app from './app';
import config from './config';
import logger from './utils/logger';

const PORT = config.PORT || 5000;

import { seedSystemUsers } from './utils/seed';

// Connect to MongoDB
mongoose
  .connect(config.MONGODB_URI)
  .then(async () => {
    logger.info('✅ Connected to MongoDB');
    
    // Seed system users
    await seedSystemUsers();
    
    app.listen(PORT, () => {
      logger.info(`🚀 Server running in ${config.NODE_ENV} mode`);
      logger.info(`🔗 URL: http://localhost:${PORT}`);
      logger.info(`📝 Swagger Docs: http://localhost:${PORT}/docs`);
    });
  })
  .catch((err) => {
    logger.error('❌ MongoDB connection error:', err);
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
