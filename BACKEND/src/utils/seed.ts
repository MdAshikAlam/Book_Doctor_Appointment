import User, { UserRole } from '../models/User';
import logger from './logger';
import config from '../config';

export const seedSystemUsers = async () => {
  try {
    const superAdminExists = await User.findOne({ email: config.SUPER_ADMIN_EMAIL });
    const superAdminRoleExists = await User.findOne({ role: UserRole.SUPER_ADMIN });

    if (!superAdminExists) {
      logger.info(`🚀 Seeding Super Admin account (${config.SUPER_ADMIN_EMAIL})...`);

      await User.create({
        name: 'System Super Admin',
        email: config.SUPER_ADMIN_EMAIL,
        password: config.SUPER_ADMIN_PASSWORD,
        role: UserRole.SUPER_ADMIN,
        isEmailVerified: true,
        emailVerified: true
      });

      logger.info(`✅ Super Admin provisioned successfully: ${config.SUPER_ADMIN_EMAIL}`);
    } else {
      logger.info(`ℹ️ Super Admin account (${config.SUPER_ADMIN_EMAIL}) already exists. Skipping seeding.`);
    }
  } catch (error) {
    logger.error(error, '❌ Error seeding system users:');
  }
};
