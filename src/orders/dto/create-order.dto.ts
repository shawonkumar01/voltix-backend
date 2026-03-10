import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateOrderDto {
    @ApiProperty({ example: '123 Main St, New York, USA' })
    @IsString()
    @IsNotEmpty()
    shippingAddress: string;

    @ApiPropertyOptional({ example: 'Please deliver before 5pm' })
    @IsString()
    @IsOptional()
    note?: string;
}