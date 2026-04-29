import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class BrandDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiPropertyOptional()
  logo?: string;

  @ApiPropertyOptional()
  description?: string;

  @ApiPropertyOptional()
  website?: string;
}

export class ProductResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  @Transform(({ value }) => parseFloat(value))
  price: number;

  @ApiPropertyOptional()
  @Transform(({ value }) => parseFloat(value))
  discountedPrice?: number;

  @ApiProperty()
  @Transform(({ value }) => parseInt(value))
  stock: number;

  @ApiPropertyOptional()
  brand?: BrandDto;

  @ApiPropertyOptional()
  brandId?: string;

  @ApiPropertyOptional()
  model?: string;

  @ApiPropertyOptional()
  @Transform(({ value }) => parseFloat(value))
  rating?: number;

  @ApiPropertyOptional()
  @Transform(({ value }) => value === 'true')
  isActive?: boolean;

  @ApiPropertyOptional()
  @Transform(({ value }) => value === 'true')
  isFeatured?: boolean;

  @ApiPropertyOptional()
  images?: string[];

  @ApiProperty()
  categoryId: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
