import {  IsMongoId,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { Types } from 'mongoose';

export class CreateHistoryDto {
  @IsMongoId()
  order_id: Types.ObjectId;

  @IsMongoId()
  customer_id: Types.ObjectId;

  @IsOptional()
  @IsString()
  reason?: string;

  @IsNumber()
  @Min(0)
  cost: number;

  @IsNumber()
  @Min(0)
  sum_dishes: number;
}
