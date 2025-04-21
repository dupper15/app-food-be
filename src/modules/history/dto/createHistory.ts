import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateHistoryDto {
  @IsString()
  order_id: string;

  @IsString()
  customer_id: string;

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
