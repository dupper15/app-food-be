import { IsNotEmpty, IsString } from 'class-validator';import { RegisterUserDto } from 'src/modules/user/dto/register.dto';

export class RegisterCustomerDto extends RegisterUserDto {
  @IsNotEmpty()
  @IsString()
  name: string;
}
