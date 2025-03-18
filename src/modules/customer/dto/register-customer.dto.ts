import { Type } from 'class-transformer';
import {
  IsArray,
  IsOptional,
  IsString,
  IsNumber,
  IsDate,
} from 'class-validator';
import { RegisterUserDto } from 'src/modules/user/dto/register.dto';

export class RegisterCustomerDto extends RegisterUserDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  avatar?: string;

  @IsArray()
  @IsOptional()
  address?: string[];

  @IsOptional()
  @IsString()
  phone?: string;

  @IsNumber()
  @IsOptional()
  total_logins?: number = 0;

  @IsNumber()
  @IsOptional()
  total_orders?: number = 0;

  @IsNumber()
  @IsOptional()
  total_time_spent?: number = 0;

  @IsDate()
  @IsOptional()
  @Type(() => Date)
  last_login?: Date;

  @IsOptional()
  isDeleted: boolean = false;

  @IsArray()
  @IsOptional()
  history?: string[];

  @IsArray()
  @IsOptional()
  cart?: string[];

  @IsArray()
  @IsOptional()
  favorite_restaurants?: string[];

  @IsNumber()
  @IsOptional()
  total_points?: number = 0;
}
