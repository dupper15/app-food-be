import { IsNotEmpty, IsNumber, IsString } from 'class-validator';import { Types } from 'mongoose';
export class CreateOrderDto {
  @IsNotEmpty()
  array_item: Types.ObjectId[];

  @IsNotEmpty()
  @IsString()
  customer_id: Types.ObjectId;

  @IsNotEmpty()
  @IsString()
  restaurant_id: Types.ObjectId;

  voucher_id: Types.ObjectId[];

  @IsNotEmpty()
  @IsNumber()
  total_price: number;

  used_point: number;

  @IsNotEmpty()
  @IsNumber()
  time_receive: number;

  @IsNotEmpty()
  @IsString()
  status: string;
}
