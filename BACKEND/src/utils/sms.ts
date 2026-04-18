import { Twilio } from 'twilio';
import config from '../config';
import logger from './logger';

let client: Twilio | null = null;

if (config.TWILIO_ACCOUNT_SID && config.TWILIO_AUTH_TOKEN) {
  client = new Twilio(config.TWILIO_ACCOUNT_SID, config.TWILIO_AUTH_TOKEN);
}

export const sendSMS = async (to: string, body: string) => {
  if (!client || !config.TWILIO_PHONE_NUMBER) {
    logger.warn('Twilio credentials not set. SMS not sent.');
    return;
  }

  try {
    const message = await client.messages.create({
      body,
      from: config.TWILIO_PHONE_NUMBER,
      to,
    });
    logger.info(`SMS sent to ${to}. Message SID: ${message.sid}`);
  } catch (error: any) {
    logger.error('Error sending SMS:', error.message);
  }
};
