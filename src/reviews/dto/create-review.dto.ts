import { IsString, IsNotEmpty, IsNumber, IsOptional, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateReviewDto {
    @ApiProperty({ example: 'product-uuid-here' })
    @IsString()
    @IsNotEmpty()
    productId: string;

    @ApiProperty({ example: 5 })
    @IsNumber()
    @Min(1)
    @Max(5)
    @Type(() => Number)
    rating: number;

    @ApiProperty({ example: 'Amazing product! Highly recommended.' })
    @IsString()
    @IsNotEmpty()
    comment: string;

    @ApiPropertyOptional({ example: 'Great Value' })
    @IsString()
    @IsOptional()
    title?: string;
}