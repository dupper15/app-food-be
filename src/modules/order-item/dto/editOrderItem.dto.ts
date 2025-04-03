import { IsNotEmpty, IsNumber, IsOptional } from 'class-validator';
import { Types } from 'mongoose';

export class EditOrderItemDto {
  @IsNotEmpty()
  @IsNumber()
  quantity: number;

  @IsOptional()
  topping: Types.ObjectId[];
}
