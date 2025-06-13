import {
  Controller,
  Post,
  UsePipes,
  ValidationPipe,
  Body,
} from '@nestjs/common';
import { AdminService } from './admin.service';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post('register')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async registerController(
    @Body() data: { email: string; password: string; confirmPassword: string },
  ) {
    return await this.adminService.registerAdmin(data);
  }

  @Post('login')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async loginController(@Body() data: { email: string; password: string }) {
    return await this.adminService.loginAdmin(data);
  }
}
