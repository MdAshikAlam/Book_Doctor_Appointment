import { Queue, Worker, Job } from 'bullmq';
import IORedis from 'ioredis';
import config from '../config';
import logger from '../utils/logger';

const connection = new IORedis({
  host: config.REDIS_HOST,
  port: parseInt(config.REDIS_PORT),
  maxRetriesPerRequest: null,
});

export const notificationQueue = new Queue('notifications', { connection });

// Worker example
const worker = new Worker(
  'notifications',
  async (job: Job) => {
    logger.info(`Processing job ${job.id} of type ${job.name}`);
    if (job.name === 'sendEmail') {
      // Logic to send email
    } else if (job.name === 'sendSMS') {
      // Logic to send SMS
    }
  },
  { connection }
);

worker.on('completed', (job) => {
  logger.info(`Job ${job.id} completed!`);
});

worker.on('failed', (job, err) => {
  logger.error(`Job ${job?.id} failed with error: ${err.message}`);
});
