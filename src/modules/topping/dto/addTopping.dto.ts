import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
export class AddToppingDto {
  @IsNotEmpty()
  restaurant_id: string;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsNumber()
  price: number;

  @IsNotEmpty()
  image: string;
}
