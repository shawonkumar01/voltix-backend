import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersRepository } from '../users/users.repository';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { User } from '../users/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto, session: any) {
    if (!dto.email || !dto.password) {
      throw new BadRequestException('Email and password are required');
    }

    const existing = await this.usersRepository.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('An account with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const user = await this.usersRepository.create({
      ...dto,
      password: hashedPassword,
    });

    // Create session
    session.user = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
    };

    return this.generateToken(user);
  }

  async login(dto: LoginDto, session: any) {
    if (!dto.email || !dto.password) {
      throw new BadRequestException('Email and password are required');
    }

    const user = await this.usersRepository.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException('No account found with this email');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Your account has been deactivated');
    }

    const isMatch = await bcrypt.compare(dto.password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Incorrect password');
    }

    // Create session
    session.user = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
    };

    return this.generateToken(user);
  }

  async validateGoogleUser(googleUser: any, session: any) {
    const { email, firstName, lastName, picture } = googleUser;
    
    let user = await this.usersRepository.findByEmail(email);
    
    if (!user) {
      // Create new user if doesn't exist
      // Generate a random password for OAuth users (they won't use it)
      const randomPassword = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      const hashedPassword = await bcrypt.hash(randomPassword, 10);
      
      user = await this.usersRepository.create({
        email,
        firstName,
        lastName,
        password: hashedPassword,
        isActive: true,
        role: 'user' as any, // Cast to any to avoid type issues
        avatar: picture,
      });
    } else {
      // Update existing user with Google info
      user = await this.usersRepository.update(user.id, {
        avatar: picture,
        isActive: true,
      });
    }

    if (!user) {
      throw new UnauthorizedException('Failed to create or update user');
    }

    // Create session
    session.user = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
    };

    return this.generateToken(user);
  }

  async logout(session: any) {
    session.destroy();
    return { message: 'Logout successful' };
  }

  private generateToken(user: User) {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    return {
      accessToken: this.jwtService.sign(payload),
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
      },
    };
  }
}
