import {
    Injectable,
    NotFoundException,
    BadRequestException,
} from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
    constructor(private readonly usersRepository: UsersRepository) { }

    async getMe(id: string) {
        const user = await this.usersRepository.findById(id);
        if (!user) throw new NotFoundException('User not found');
        const { password, ...result } = user;
        return result;
    }

    async updateMe(id: string, dto: UpdateUserDto) {
        if (Object.keys(dto).length === 0) {
            throw new BadRequestException('No fields provided to update');
        }
        const user = await this.usersRepository.findById(id);
        if (!user) throw new NotFoundException('User not found');
        await this.usersRepository.update(id, dto);
        return this.getMe(id);
    }

    async findAll() {
        const users = await this.usersRepository.findAll();
        if (!users.length) return { message: 'No users found', data: [] };
        return users.map(({ password, ...rest }) => rest);
    }

    async deleteUser(id: string) {
        const user = await this.usersRepository.findById(id);
        if (!user) throw new NotFoundException(`User with id "${id}" not found`);
        await this.usersRepository.remove(user);
        return { message: 'User deleted successfully' };
    }
}