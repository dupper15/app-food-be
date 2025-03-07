import { IsMongoId, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { Types } from 'mongoose';
export class CreateDishDto {
  @IsNotEmpty()
  @IsString()
  @IsMongoId()
  restaurant_id: Types.ObjectId;

  @IsNotEmpty()
  @IsString()
  @IsMongoId()
  category_id: Types.ObjectId;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  introduce: string;

  @IsNotEmpty()
  @IsString()
  image: string;

  @IsNotEmpty()
  @IsNumber()
  time: number;

  @IsNotEmpty()
  @IsNumber()
  price: number;

  topping: Types.ObjectId[];
}
