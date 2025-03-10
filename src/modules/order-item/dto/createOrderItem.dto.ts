import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { Types } from 'mongoose';

export class CreateOrderItemDto {
  @IsNotEmpty()
  @IsString()
  dish_id: Types.ObjectId;

  @IsNotEmpty()
  @IsNumber()
  quantity: number;

  @IsOptional()
  topping_array: Types.ObjectId[];
}
