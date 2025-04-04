import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
export class CreateDishDto {
  @IsNotEmpty()
  @IsString()
  restaurant_id: string;

  @IsNotEmpty()
  @IsString()
  category_id: string;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  introduce: string;

  @IsOptional()
  @IsString()
  image?: string;

  @IsNotEmpty()
  time: string;

  @IsNotEmpty()
  price: string;

  topping: string[];
}
