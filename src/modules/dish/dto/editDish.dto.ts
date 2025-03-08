import { IsMongoId, IsNumber, IsOptional, IsString } from 'class-validator';
import { Types } from 'mongoose';
export class EditDishDto {
  @IsOptional()
  @IsString()
  @IsMongoId()
  restaurant_id: Types.ObjectId;

  @IsOptional()
  @IsString()
  @IsMongoId()
  category_id: Types.ObjectId;

  @IsOptional()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  introduce: string;

  @IsOptional()
  @IsString()
  image: string;

  @IsOptional()
  @IsNumber()
  time: number;

  @IsOptional()
  @IsNumber()
  price: number;

  @IsOptional()
  topping: Types.ObjectId[];
}
