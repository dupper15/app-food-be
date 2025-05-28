import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { UserService } from './user.service';
import { RegisterUserDto } from './dto/register.dto';
import { LoginUserDto } from './dto/login.dto';
import { User } from './user.schema';

@Controller('users')
export class UserController<T extends User> {
  constructor(private readonly userService: UserService<T>) {}

  @Get('all')
  async fetchAllUsers(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return await this.userService.fetchAllUser(page, limit);
  }

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
  @Delete(':id')
  async deleteUser(@Param('id') id: string) {
    return await this.userService.deleteUser(id);
  }
  @Get(':id')
  async fetchDetailUser(@Param('id') id: string) {
    return await this.userService.fetchDetailUser(id);
  }
  @Put('change-password/:id')
  async changePassword(@Param('id') id: string, @Body() data: any) {
    return await this.userService.changePassword(id, data);
  }
  @Put('/:id/usage-time')
  async updateUsageTime(@Param('id') id: string, @Body() data: any) {
    return await this.userService.updateUsageTime(id, data);
  }
  @Patch('change-status/:id')
  async changeStatus(@Param('id') id: string) {
    return await this.userService.changeUserStatus(id);
  }
}
