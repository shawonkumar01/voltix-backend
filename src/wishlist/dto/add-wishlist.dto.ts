import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddWishlistDto {
    @ApiProperty({ example: 'product-uuid-here' })
    @IsString()
    @IsNotEmpty()
    productId: string;
}