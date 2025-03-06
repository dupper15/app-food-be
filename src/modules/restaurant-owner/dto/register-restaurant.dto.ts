import { IsBoolean, IsNumber, IsString } from 'class-validator';
import { RegisterUserDto } from 'src/modules/user/dto/register.dto';

export class RegisterRestaurantDto extends RegisterUserDto {
  @IsString()
  avatar: string = '';

  @IsNumber()
  total_time_spend: number = 0;

  @IsNumber()
  total_logins: number = 0;

  @IsString()
  phone: string = '';

  @IsBoolean()
  isDeleted: boolean = false;
}
