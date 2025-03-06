import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsArray,
  IsBoolean,
  IsNumber,
  IsMongoId,
  IsEnum,
} from 'class-validator';
import { Types } from 'mongoose';

export class CreateRestaurantDto {
  @IsNotEmpty()
  @IsMongoId()
  owner_id: Types.ObjectId;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNumber()
  @IsOptional()
  total_reviews: number;

  @IsNumber()
  @IsOptional()
  total_orders: number;

  @IsNotEmpty()
  @IsString()
  address: string;

  @IsOptional()
  @IsNumber()
  rating?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  banner?: Array<string>;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  category?: Array<string>;

  @IsOptional()
  @IsBoolean()
  isDeleted: boolean;

  @IsOptional()
  @IsEnum(['Enable', 'Disable'])
  status?: string;
}
