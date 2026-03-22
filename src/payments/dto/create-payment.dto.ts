import { IsString, IsNotEmpty, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePaymentDto {
    @ApiProperty({ example: 'order-uuid-here' })
    @IsString()
    @IsNotEmpty()
    @IsUUID()
    orderId: string;
}