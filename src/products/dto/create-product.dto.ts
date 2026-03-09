import {
    IsString,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsArray,
    Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateProductDto {
    @ApiProperty({ example: 'iPhone 15 Pro' })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({ example: 'Latest iPhone with A17 Pro chip' })
    @IsString()
    @IsNotEmpty()
    description: string;

    @ApiProperty({ example: 999.99 })
    @IsNumber()
    @Min(0)
    @Type(() => Number)
    price: number;

    @ApiProperty({ example: 50 })
    @IsNumber()
    @Min(0)
    @Type(() => Number)
    stock: number;

    @ApiPropertyOptional({ example: 'Apple' })
    @IsString()
    @IsOptional()
    brand?: string;

    @ApiPropertyOptional({ example: 'iPhone 15 Pro' })
    @IsString()
    @IsOptional()
    model?: string;

    @ApiPropertyOptional({ example: ['https://image1.jpg', 'https://image2.jpg'] })
    @IsArray()
    @IsOptional()
    images?: string[];

    @ApiProperty({ example: 'category-uuid-here' })
    @IsString()
    @IsNotEmpty()
    categoryId: string;
}