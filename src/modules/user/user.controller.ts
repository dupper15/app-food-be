import {  Body,
  Controller,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { UserService } from './user.service';
import { RegisterUserDto } from './dto/register.dto';
import { IUser } from './user.interface';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService<IUser>) {}

  @Post()
  @UsePipes(new ValidationPipe())
  async registerUser(@Body() registerUserDto: RegisterUserDto) {
    return await this.userService.register(registerUserDto);
  }
}
