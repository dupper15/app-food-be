import {
  Body,
  Controller,
  Post,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { UserService } from './user.service';
import { RegisterUserDto } from './dto/register.dto';
import { User } from './user.schema';
import { LoginUserDto } from './dto/login.dto';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService<User>) {}

  @Post('register')
  @UsePipes(new ValidationPipe())
  async registerUser(@Body() registerUserDto: RegisterUserDto) {
    return await this.userService.register(registerUserDto);
  }

  @Post('login')
  @UsePipes(new ValidationPipe())
  async loginUser(@Body() loginUserDto: LoginUserDto) {
    return await this.userService.login(loginUserDto);
  }

  @Post('logout')
  async logoutUser() {
    return await this.userService.logout();
  }

  @Post('send-code')
  async sendCode(@Query('email') email: string) {
    return await this.userService.sendCode(email);
  }

  @Post('verified-code')
  async verifiedCode(
    @Query('email') email: string,
    @Body('verified_code') verified_code: number,
  ) {
    return await this.userService.verifiedCode(email, verified_code);
  }
}
