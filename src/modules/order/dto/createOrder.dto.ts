import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { Types } from 'mongoose';
export class CreateOrderDto {
  @IsNotEmpty()
  array_item: Types.ObjectId[];

  @IsNotEmpty()
  @IsString()
  customer_id: Types.ObjectId;

  @IsNotEmpty()
  @IsString()
  restaurant_id: Types.ObjectId;

  @IsOptional()
  voucher_id: Types.ObjectId[];

  @IsNotEmpty()
  @IsNumber()
  total_price: number;

  @IsOptional()
  used_point: number;

  @IsOptional()
  note: string;

  @IsOptional()
  @IsNumber()
  time_receive: number;

  @IsOptional()
  @IsString()
  status: string;
}
