import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
export class EditToppingDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsNumber({}, { message: 'Price must be a number' })
  price: number;

  @IsNotEmpty()
  @IsString()
  image: string;
}
