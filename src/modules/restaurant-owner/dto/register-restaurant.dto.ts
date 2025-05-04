import { IsBoolean, IsString } from 'class-validator';
import { RegisterUserDto } from 'src/modules/user/dto/register.dto';

export class RegisterRestaurantDto extends RegisterUserDto {
  @IsString()
  avatar: string = '';

  @IsString()
  phone: string = '';

  @IsBoolean()
  isDeleted: boolean = false;
}
