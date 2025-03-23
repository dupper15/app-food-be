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
  @IsOptional()
  avatar?: string; // ✅ Chỉ lưu URL sau khi upload

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  banners?: string[];

  @IsNotEmpty()
  @IsString()
  address: string;

  @IsOptional()
  @IsNumber()
  rating?: number;

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
