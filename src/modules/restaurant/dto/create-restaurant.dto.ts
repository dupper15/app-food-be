import {  IsNotEmpty,
  IsString,
  IsOptional,
  IsArray,
  IsBoolean,
  IsNumber,
} from 'class-validator';

export class CreateRestaurantDto {
  @IsNotEmpty()
  @IsString()
  owner_id: string;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNumber()
  total_reviews: number;

  @IsNumber()
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
}
