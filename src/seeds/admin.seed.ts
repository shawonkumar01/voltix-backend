import { DataSource } from 'typeorm';
import { User, UserRole } from '../users/user.entity';
import * as bcrypt from 'bcrypt';

export async function seedAdmin(dataSource: DataSource) {
  const userRepository = dataSource.getRepository(User);

  // Check if admin already exists
  const existingAdmin = await userRepository.findOne({
    where: { email: 'admin@gmail.com' },
  });

  if (existingAdmin) {
    return existingAdmin;
  }

  // Hash password
  const hashedPassword = await bcrypt.hash('Admin@123456', 10);

  // Create admin user
  const admin = userRepository.create({
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@gmail.com',
    password: hashedPassword,
    role: UserRole.ADMIN,
    isActive: true,
    isEmailVerified: true,
  });

  await userRepository.save(admin);
  return admin;
}
