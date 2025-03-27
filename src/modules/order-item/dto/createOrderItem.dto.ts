import { IsNotEmpty, IsNumber, IsOptional } from 'class-validator';
import { Types } from 'mongoose';

export class CreateOrderItemDto {
  @IsNotEmpty()
  dish_id: Types.ObjectId;

  @IsNotEmpty()
  @IsNumber()
  quantity: number;

  user_id: Types.ObjectId;

  @IsOptional()
  topping: Types.ObjectId[];
}
