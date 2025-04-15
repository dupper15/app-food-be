import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { Types } from 'mongoose';
export class AddToppingDto {
  @IsNotEmpty()
  restaurant_id: Types.ObjectId;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsNumber()
  price: number;
}
