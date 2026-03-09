import { IsString, IsOptional, IsPhoneNumber } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserDto {
    @ApiPropertyOptional({ example: 'John' })
    @IsString()
    @IsOptional()
    firstName?: string;

    @ApiPropertyOptional({ example: 'Doe' })
    @IsString()
    @IsOptional()
    lastName?: string;

    @ApiPropertyOptional({ example: '+1234567890' })
    @IsString()
    @IsOptional()
    phone?: string;

    @ApiPropertyOptional({ example: '123 Main St, New York' })
    @IsString()
    @IsOptional()
    address?: string;

    @ApiPropertyOptional({ example: 'https://avatar.url/image.jpg' })
    @IsString()
    @IsOptional()
    avatar?: string;
}