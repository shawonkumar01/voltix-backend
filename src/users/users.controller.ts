import {
    Controller, Get, Patch, Delete,
    Body, Param, UseGuards, Request,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { ApiProtectedResponses, ApiAdminResponses } from '../common/decorators/api-response.decorator';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Get('me')
    @ApiOperation({ summary: 'Get my profile' })
    @ApiProtectedResponses()
    getMe(@Request() req: any) {
        return this.usersService.getMe(req.user.id);
    }

    @Patch('me')
    @ApiOperation({ summary: 'Update my profile' })
    @ApiProtectedResponses()
    updateMe(@Request() req: any, @Body() dto: UpdateUserDto) {
        return this.usersService.updateMe(req.user.id, dto);
    }

    @Get()
    @ApiOperation({ summary: 'Get all users - Admin only' })
    @ApiAdminResponses()
    @UseGuards(RolesGuard)
    @Roles('admin')
    findAll() {
        return this.usersService.findAll();
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete user - Admin only' })
    @ApiAdminResponses()
    @UseGuards(RolesGuard)
    @Roles('admin')
    deleteUser(@Param('id') id: string) {
        return this.usersService.deleteUser(id);
    }
}