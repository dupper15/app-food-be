import {
  Body,
  Controller,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { CustomerService } from './customer.service';
import { RegisterCustomerDto } from './dto/register-customer.dto';
import { UserController } from '../user/user.controller';
import { Customer } from './customer.schema';

@Controller('customers')
export class CustomersController extends UserController<Customer> {
  constructor(private readonly customerService: CustomerService) {
    super(customerService);
  }

  @Post('')
  @UsePipes(new ValidationPipe())
  async register(@Body() registerCustomerDto: RegisterCustomerDto) {
    return await this.customerService.register(registerCustomerDto);
  }
}
