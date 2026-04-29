import {
  IsString,
  IsOptional,
  IsNumber,
  IsArray,
  IsBoolean,
  IsObject,
  Min,
  Max,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class UpdateProductDto {
  @ApiPropertyOptional({ example: 'iPhone 15 Pro' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ example: 'Latest iPhone with A17 Pro chip' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: 999.99 })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  @IsOptional()
  price?: number;

  @ApiPropertyOptional({ example: 50 })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  @IsOptional()
  stock?: number;

  @ApiPropertyOptional({ example: 10 })
  @IsNumber()
  @Min(0)
  @Max(100)
  @Type(() => Number)
  @IsOptional()
  discount?: number;

  @ApiPropertyOptional({ example: 'brand-uuid-here' })
  @IsString()
  @IsOptional()
  brandId?: string;

  @ApiPropertyOptional({ example: 'iPhone 15 Pro' })
  @IsString()
  @IsOptional()
  model?: string;

  @ApiPropertyOptional({ example: ['https://image1.jpg'] })
  @IsArray()
  @IsOptional()
  images?: string[];

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiPropertyOptional({ example: 'category-uuid-here' })
  @IsString()
  @IsOptional()
  categoryId?: string;

  @ApiPropertyOptional({
    example: { RAM: '16GB', Storage: '512GB' },
  })
  @IsObject()
  @IsOptional()
  specifications?: Record<string, string>;
}