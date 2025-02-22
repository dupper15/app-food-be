import { Injectable } from '@nestjs/common';import { InjectModel } from '@nestjs/mongoose';
import { Customer } from './customer.schema';
import { RegisterCustomerDto } from './dto/register-customer.dto';
import { UserService } from '../user/user.service';
import { Model } from 'mongoose';
import { User } from '../user/user.schema';
import { ICustomer } from './customer.interface';

@Injectable()
export class CustomerService extends UserService<ICustomer> {
  constructor(
    @InjectModel(Customer.name)
    private readonly customerModel: Model<ICustomer>,
  ) {
    super(customerModel);
  }
}
