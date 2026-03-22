import { IsString, IsOptional, IsNumber, Min, Max } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class UpdateReviewDto {
    @ApiPropertyOptional({ example: 4 })
    @IsNumber()
    @Min(1)
    @Max(5)
    @Type(() => Number)
    @IsOptional()
    rating?: number;

    @ApiPropertyOptional({ example: 'Updated review comment' })
    @IsString()
    @IsOptional()
    comment?: string;

    @ApiPropertyOptional({ example: 'Updated Title' })
    @IsString()
    @IsOptional()
    title?: string;
}