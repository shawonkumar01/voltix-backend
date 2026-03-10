import { IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class UpdateCartDto {
    @ApiProperty({ example: 2 })
    @IsNumber()
    @Min(1)
    @Type(() => Number)
    quantity: number;
}