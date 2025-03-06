import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Admin } from './admin.schema';
import { UserService } from './../user/user.service';
import { JwtService } from 'src/jwt/jwt.service';
import { MailService } from 'src/mailer/mail.service';
import * as bcrypt from 'bcrypt';
import { Model } from 'mongoose';
import { RegisterUserDto } from '../user/dto/register.dto';
import { Customer } from '../customer/customer.schema';
import { RestaurantOwner } from '../restaurant-owner/restaurant-owner.schema';
@Injectable()
export class AdminService extends UserService<Admin> {
  constructor(
    @InjectModel(Admin.name)
    protected readonly adminModel: Model<Admin>,
    protected readonly jwtService: JwtService,
    protected readonly mailService: MailService,
    @InjectModel(Customer.name)
    protected readonly customerModel: Model<Customer>,
    @InjectModel(RestaurantOwner.name)
    protected readonly restaurantOwnerModel: Model<RestaurantOwner>,
  ) {
    super(
      adminModel,
      restaurantOwnerModel,
      customerModel,
      adminModel,
      jwtService,
      mailService,
    );
  }
  async register(registerUserDto: RegisterUserDto): Promise<Admin> {
    const { email, password, confirmPassword } = registerUserDto;
    if (await super.checkUser(email)) {
      throw new BadRequestException('Email already exists');
    }
    if (password !== confirmPassword) {
      throw new BadRequestException('Password not match! Please try again');
    }
    if (typeof password !== 'string') {
      throw new Error('Password must be a string');
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const hashedPassword = await bcrypt.hash(password, 10);
    const newAdmin = new this.adminModel({
      ...registerUserDto,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      password: hashedPassword,
    });
    return newAdmin.save();
  }
}
