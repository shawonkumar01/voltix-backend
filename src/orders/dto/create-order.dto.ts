import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentMethod } from '../order.entity';

export class CreateOrderDto {
  // Shipping details
  @ApiProperty({ example: 'John' })
  @IsString()
  @IsNotEmpty()
  shippingFirstName: string;

  @ApiProperty({ example: 'Doe' })
  @IsString()
  @IsNotEmpty()
  shippingLastName: string;

  @ApiProperty({ example: '123 Main St' })
  @IsString()
  @IsNotEmpty()
  shippingAddress: string;

  @ApiProperty({ example: 'New York' })
  @IsString()
  @IsNotEmpty()
  shippingCity: string;

  @ApiProperty({ example: 'NY' })
  @IsString()
  @IsNotEmpty()
  shippingState: string;

  @ApiProperty({ example: '10001' })
  @IsString()
  @IsNotEmpty()
  shippingZip: string;

  @ApiProperty({ example: 'USA' })
  @IsString()
  @IsNotEmpty()
  shippingCountry: string;

  @ApiPropertyOptional({ example: '+1234567890' })
  @IsString()
  @IsOptional()
  shippingPhone?: string;

  @ApiPropertyOptional({ enum: PaymentMethod, example: PaymentMethod.STRIPE })
  @IsEnum(PaymentMethod)
  @IsOptional()
  paymentMethod?: PaymentMethod = PaymentMethod.CASH_ON_DELIVERY;

  @ApiPropertyOptional({ example: 'Please deliver before 5pm' })
  @IsString()
  @IsOptional()
  note?: string;
}
