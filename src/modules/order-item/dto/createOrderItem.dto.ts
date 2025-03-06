import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { ObjectId } from 'mongoose';

export class CreateOrderItemDto {
  @IsNotEmpty()
  @IsString()
  dish_id: ObjectId;

  @IsNotEmpty()
  @IsNumber()
  quantity: number;

  topping_array: Array<ObjectId>;
}
