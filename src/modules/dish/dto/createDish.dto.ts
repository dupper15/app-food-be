import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { ObjectId } from 'mongoose';
export class CreateDishDto {
  @IsNotEmpty()
  @IsString()
  restaurant_id: ObjectId;

  @IsNotEmpty()
  @IsString()
  category_id: ObjectId;

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

  topping: Array<ObjectId>;
}
