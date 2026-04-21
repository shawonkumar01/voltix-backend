import { IsString, IsNumber, Min } from 'class-validator';

export class AddToCartDto {
  @IsString()
  productId: string;

  @IsNumber()
  @Min(1)
  quantity: number;
}

export class UpdateCartDto {
  @IsNumber()
  @Min(1)
  quantity: number;
}
