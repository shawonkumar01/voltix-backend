import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private readonly userRepo: Repository<User>,
    ) { }

    async getMe(id: string) {
        const user = await this.userRepo.findOne({ where: { id } });
        if (!user) throw new NotFoundException('User not found');
        const { password, ...result } = user;
        return result;
    }

    async updateMe(id: string, dto: UpdateUserDto) {
        await this.userRepo.update(id, dto);
        return this.getMe(id);
    }

    async findAll() {
        const users = await this.userRepo.find();
        return users.map(({ password, ...rest }) => rest);
    }

    async deleteUser(id: string) {
        const user = await this.userRepo.findOne({ where: { id } });
        if (!user) throw new NotFoundException('User not found');
        await this.userRepo.remove(user);
        return { message: 'User deleted successfully' };
    }
}