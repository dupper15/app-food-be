import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
export class CreateVoucherDto {
  @IsNotEmpty()
  @IsString()
  restaurant_id: string;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  content: string;

  @IsNotEmpty()
  @IsNumber()
  quantity: number;

  @IsNotEmpty()
  @IsNumber()
  value: number;

  @IsNotEmpty()
  @IsNumber()
  max: number;

  @IsNotEmpty()
  @IsNumber()
  min: number;

  @IsNotEmpty()
  start_date: Date;

  @IsNotEmpty()
  expire_date: Date;
}
