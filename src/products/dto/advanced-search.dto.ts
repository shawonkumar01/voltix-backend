import {
  IsString,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsArray,
  IsObject,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export enum SortOption {
  NEWEST = 'newest',
  PRICE_LOW = 'price_low',
  PRICE_HIGH = 'price_high',
  RATING = 'rating',
  NAME = 'name',
  BEST_SELLING = 'best_selling',
}

export class AdvancedSearchDto {
  @ApiPropertyOptional({ example: 'iPhone 15' })
  @IsString()
  @IsOptional()
  query?: string;

  @ApiPropertyOptional({ example: ['Apple', 'Samsung'] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  brands?: string[];

  @ApiPropertyOptional({ example: ['Smartphones', 'Laptops'] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  categories?: string[];

  @ApiPropertyOptional({ example: 500 })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  @IsOptional()
  minPrice?: number;

  @ApiPropertyOptional({ example: 2000 })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  @IsOptional()
  maxPrice?: number;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  inStock?: boolean;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  isFeatured?: boolean;

  @ApiPropertyOptional({ example: 4 })
  @IsNumber()
  @Min(0)
  @Max(5)
  @Type(() => Number)
  @IsOptional()
  minRating?: number;

  @ApiPropertyOptional({
    example: { RAM: '8GB', OS: 'iOS 17', Storage: '256GB' },
    description: 'Filter by any product specification key-value pairs',
  })
  @IsObject()
  @IsOptional()
  specs?: Record<string, string>;

  @ApiPropertyOptional({
    enum: SortOption,
    example: SortOption.NEWEST,
  })
  @IsString()
  @IsOptional()
  sortBy?: SortOption = SortOption.NEWEST;

  @ApiPropertyOptional({ example: 1 })
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({ example: 20 })
  @IsNumber()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  @IsOptional()
  limit?: number = 20;
}