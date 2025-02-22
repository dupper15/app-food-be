import {  Body,
  Controller,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { CustomerService } from './customer.service';
import { ICustomer } from './customer.interface';

@Controller('customers')
export class CustomersController {
  constructor(private readonly customerService: CustomerService) {}

  @Post()
  @UsePipes(new ValidationPipe())
  async registerCustomer(@Body() registerCustomerDto: ICustomer) {
    return await this.customerService.register(registerCustomerDto);
  }
}
