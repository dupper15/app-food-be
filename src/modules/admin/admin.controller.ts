import {
  Controller,
  Post,
  UsePipes,
  ValidationPipe,
  Body,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { UserController } from '../user/user.controller';
import { Admin } from './admin.schema';
import { RegisterUserDto } from '../user/dto/register.dto';

@Controller('admin')
export class AdminController extends UserController<Admin> {
  constructor(private readonly adminService: AdminService) {
    super(adminService);
  }

  @Post('')
  @UsePipes(new ValidationPipe())
  async register(@Body() userDto: RegisterUserDto) {
    return await this.adminService.register(userDto);
  }
}
