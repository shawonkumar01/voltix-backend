import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { User, UserRole } from '../users/user.entity';
import * as bcrypt from 'bcrypt';

async function seed() {
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'voltix',
    entities: [User],
    synchronize: true,
  });

  try {
    await dataSource.initialize();
    console.log('Database connected');

    const userRepository = dataSource.getRepository(User);

    // Check if admin already exists
    const existingAdmin = await userRepository.findOne({
      where: { email: 'admin@gmail.com' },
    });

    if (existingAdmin) {
      console.log('Admin user already exists');
      await dataSource.destroy();
      return;
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
    console.log('✅ Admin user created successfully');
    console.log('   Email: admin@gmail.com');
    console.log('   Password: Admin@123456');

    await dataSource.destroy();
  } catch (error) {
    console.error('Error seeding admin:', error);
    await dataSource.destroy();
    process.exit(1);
  }
}

seed();
