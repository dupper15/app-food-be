import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Customer } from './customer.schema';
import { RegisterCustomerDto } from './dto/register-customer.dto';
import { UserService } from '../user/user.service';
import { Model } from 'mongoose';
import { JwtService } from 'src/jwt/jwt.service';
import { RestaurantOwner } from '../restaurant-owner/restaurant-owner.schema';
import { MailService } from 'src/mailer/mail.service';

@Injectable()
export class CustomerService extends UserService<Customer> {
  constructor(
    @InjectModel(Customer.name)
    protected readonly customerModel: Model<Customer>,
    protected readonly jwtService: JwtService,
    protected readonly mailService: MailService,
  ) {
    super(customerModel, jwtService, mailService);
  }
}
