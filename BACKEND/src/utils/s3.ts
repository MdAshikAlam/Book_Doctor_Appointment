import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import config from '../config';
import logger from './logger';

const s3Client = new S3Client({
  region: config.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: config.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: config.AWS_SECRET_ACCESS_KEY || '',
  },
});

export const uploadToS3 = async (file: Express.Multer.File, folder: string = 'uploads') => {
  if (!config.AWS_BUCKET_NAME) {
    logger.warn('AWS Bucket Name not set. S3 upload skipped.');
    return null;
  }

  const key = `${folder}/${Date.now()}-${file.originalname}`;
  
  const command = new PutObjectCommand({
    Bucket: config.AWS_BUCKET_NAME,
    Key: key,
    Body: file.buffer,
    ContentType: file.mimetype,
  });

  try {
    await s3Client.send(command);
    const url = `https://${config.AWS_BUCKET_NAME}.s3.${config.AWS_REGION}.amazonaws.com/${key}`;
    logger.info(`File uploaded to S3: ${url}`);
    return url;
  } catch (error: any) {
    logger.error('Error uploading to S3:', error.message);
    throw error;
  }
};
