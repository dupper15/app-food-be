import { IsNotEmpty, IsString, Matches, MinLength } from 'class-validator';
export class RegisterUserDto {
  @IsNotEmpty()
  @IsString()
  email: string;

  @IsNotEmpty()
  @IsString()
  @Matches(/^[0-9]{10}$/, { message: 'Phone number must be 10 character.' })
  phone_number: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  password: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  confirmPassword: string;
}
