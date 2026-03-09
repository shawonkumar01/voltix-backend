import {
    Injectable,
    ConflictException,
    UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from '../users/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User)
        private readonly userRepo: Repository<User>,
        private readonly jwtService: JwtService,
    ) { }

    async register(dto: RegisterDto) {
        // Check if email already exists
        const existing = await this.userRepo.findOne({
            where: { email: dto.email },
        });
        if (existing) throw new ConflictException('Email already registered');

        // Hash password
        const hashedPassword = await bcrypt.hash(dto.password, 10);

        // Create user
        const user = this.userRepo.create({
            ...dto,
            password: hashedPassword,
        });

        await this.userRepo.save(user);

        // Return token
        return this.generateToken(user);
    }

    async login(dto: LoginDto) {
        // Find user
        const user = await this.userRepo.findOne({
            where: { email: dto.email },
        });
        if (!user) throw new UnauthorizedException('Invalid credentials');

        // Check password
        const isMatch = await bcrypt.compare(dto.password, user.password);
        if (!isMatch) throw new UnauthorizedException('Invalid credentials');

        // Return token
        return this.generateToken(user);
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