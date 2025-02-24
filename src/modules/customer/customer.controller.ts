import {
  Body,
  Controller,
  Post,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { CustomerService } from './customer.service';
import { RegisterCustomerDto } from './dto/register-customer.dto';
import { LoginCustomerDto } from './dto/login-customer.dto';

@Controller('customers')
export class CustomersController {
  constructor(private readonly customerService: CustomerService) {}

  @Post('register')
  @UsePipes(new ValidationPipe())
  async registerCustomer(@Body() registerCustomerDto: RegisterCustomerDto) {
    return await this.customerService.register(registerCustomerDto);
  }

  @Post('login')
  @UsePipes(new ValidationPipe())
  async loginCustomer(@Body() loginUserDto: LoginCustomerDto) {
    return await this.customerService.login(loginUserDto);
  }

  @Post('logout')
  async logoutCustomer() {
    return await this.customerService.logout();
  }

  @Post('send-code')
  async sendCode(@Query('email') email: string) {
    return await this.customerService.sendCode(email);
  }

  @Post('verified-code')
  async verifiedCode(
    @Query('email') email: string,
    @Body('verified_code') verified_code: number,
  ) {
    return await this.customerService.verifiedCode(email, verified_code);
  }
}
