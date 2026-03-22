import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsArray,
  IsBoolean,
  IsObject,
  Min,
  Max,
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

  @ApiPropertyOptional({ example: 'VLT-APL-001' })
  @IsString()
  @IsOptional()
  sku?: string;

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

  @ApiPropertyOptional({ example: '1 Year Manufacturer Warranty' })
  @IsString()
  @IsOptional()
  warranty?: string;

  @ApiPropertyOptional({ example: 174 })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  weight?: number;

  @ApiPropertyOptional({ example: 10 })
  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  @Type(() => Number)
  discount?: number;

  @ApiPropertyOptional({
    example: ['https://image1.jpg', 'https://image2.jpg'],
  })
  @IsArray()
  @IsOptional()
  images?: string[];

  @ApiPropertyOptional({ example: false })
  @IsBoolean()
  @IsOptional()
  isFeatured?: boolean;

  @ApiPropertyOptional({
    example: {
      RAM: '8GB',
      Storage: '256GB',
      Processor: 'A17 Pro',
      OS: 'iOS 17',
      Display: '6.1 inch',
      Battery: '3274 mAh',
    },
  })
  @IsObject()
  @IsOptional()
  specifications?: Record<string, string>;

  @ApiProperty({ example: 'category-uuid-here' })
  @IsString()
  @IsNotEmpty()
  categoryId: string;
}