import {
  IsArray,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { Types } from 'mongoose';

export class CreateRatingDto {
  @IsMongoId()
  order_id: Types.ObjectId;

  @IsMongoId()
  customer_id: Types.ObjectId;

  @IsMongoId()
  restaurant_id: Types.ObjectId;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  image?: string[];

  @IsNotEmpty()
  @IsString()
  content: string;

  @IsNumber()
  @Min(1)
  @Max(5)
  rating: number;

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  replies_array?: Types.ObjectId[];
}
