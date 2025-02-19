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

  @IsNotEmpty()
  @IsBoolean()
  isDeleted: boolean;
}
