import { IsNotEmpty, IsString, IsOptional } from 'class-validator';
export class EditRestaurantDto {
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
  @IsString({ each: true })
  bannersRemaining: string[];
}
