import { IsString, IsOptional, IsNumber, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class FilterProductDto {
  @ApiPropertyOptional({ example: 'iPhone' })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({ example: 'category-uuid-here' })
  @IsString()
  @IsOptional()
  categoryId?: string;

  @ApiPropertyOptional({ example: 'Apple' })
  @IsString()
  @IsOptional()
  brand?: string;

  @ApiPropertyOptional({ example: 0 })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  @IsOptional()
  minPrice?: number;

  @ApiPropertyOptional({ example: 9999 })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  @IsOptional()
  maxPrice?: number;

  @ApiPropertyOptional({ example: 1 })
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({ example: 10 })
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  @IsOptional()
  limit?: number = 10;
}
