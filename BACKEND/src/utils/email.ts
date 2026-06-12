import nodemailer from 'nodemailer';
import config from '../config';
import logger from './logger';

const transporter = nodemailer.createTransport({
  host: config.EMAIL_HOST,
  port: parseInt(config.EMAIL_PORT),
  secure: config.EMAIL_SECURE === 'true',
  auth: {
    user: config.EMAIL_USER,
    pass: config.EMAIL_PASS,
  },
});

export const sendEmail = async (to: string, subject: string, text: string, html?: string) => {
  if (!config.EMAIL_USER || !config.EMAIL_PASS) {
    logger.warn('Email credentials not set. Logging email to console instead.');
    console.log('-----------------------------------');
    console.log(`TO: ${to}`);
    console.log(`SUBJECT: ${subject}`);
    console.log(`BODY: ${text}`);
    console.log('-----------------------------------');
    return;
  }

  const mailOptions = {
    from: config.EMAIL_FROM || config.EMAIL_USER,
    to,
    subject,
    text,
    html: html || text,
  };

  try {
    await transporter.sendMail(mailOptions);
    logger.info(`✅ Email sent successfully to ${to}`);
  } catch (error: any) {
    logger.error('❌ Error sending email:', error.message);
    throw new Error(`Email delivery failed: ${error.message}`);
  }
};
