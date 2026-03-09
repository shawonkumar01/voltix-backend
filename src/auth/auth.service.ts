import {
    Injectable,
    ConflictException,
    UnauthorizedException,
    BadRequestException,
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
        if (!dto.email || !dto.password) {
            throw new BadRequestException('Email and password are required');
        }

        const existing = await this.userRepo.findOne({
            where: { email: dto.email },
        });
        if (existing) {
            throw new ConflictException('An account with this email already exists');
        }

        const hashedPassword = await bcrypt.hash(dto.password, 10);

        const user = this.userRepo.create({
            ...dto,
            password: hashedPassword,
        });

        await this.userRepo.save(user);
        return this.generateToken(user);
    }

    async login(dto: LoginDto) {
        if (!dto.email || !dto.password) {
            throw new BadRequestException('Email and password are required');
        }

        const user = await this.userRepo.findOne({
            where: { email: dto.email },
        });
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