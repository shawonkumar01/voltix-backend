import { IsString, IsNotEmpty, IsUUID, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PaymentMethod } from '../../orders/order.entity';

export class CreatePaymentDto {
    @ApiProperty({ example: 'order-uuid-here' })
    @IsString()
    @IsNotEmpty()
    @IsUUID()
    orderId: string;

    @ApiProperty({ example: 'stripe', enum: PaymentMethod })
    @IsEnum(PaymentMethod)
    @IsNotEmpty()
    paymentMethod: PaymentMethod;
}