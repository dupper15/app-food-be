import { IsNotEmpty, IsString, IsOptional, IsNumber } from 'class-validator';export class EditRestaurantDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsOptional()
  @IsString({ each: true })
  banners?: string[];

  @IsNotEmpty()
  @IsString()
  address: string;

  @IsOptional()
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @IsNumber()
  longitude?: number;

  @IsOptional()
  @IsString({ each: true })
  bannersRemaining: string[];
}
