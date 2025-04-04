import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { UserService } from '../user/user.service';
import { Model, Types } from 'mongoose';
import { JwtService } from 'src/jwt/jwt.service';
import { MailService } from 'src/mailer/mail.service';
import { Customer } from './customer.schema';
import { RegisterCustomerDto } from './dto/register-customer.dto';
import * as bcrypt from 'bcrypt';
import { RestaurantOwner } from './../restaurant-owner/restaurant-owner.schema';
import { Admin } from './../admin/admin.schema';

@Injectable()
export class CustomerService extends UserService<Customer> {
  constructor(
    @InjectModel(Customer.name)
    protected readonly customerModel: Model<Customer>,
    @InjectModel(RestaurantOwner.name)
    protected readonly restaurantOwnerModel: Model<RestaurantOwner>,
    @InjectModel(Admin.name) protected readonly adminModel: Model<Admin>,
    protected readonly jwtService: JwtService,
    protected readonly mailService: MailService,
  ) {
    super(
      customerModel,
      restaurantOwnerModel,
      customerModel,
      adminModel,
      jwtService,
      mailService,
    );
  }
  async register(registerCustomerDto: RegisterCustomerDto): Promise<Customer> {
    const { email, password, confirmPassword } = registerCustomerDto;
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
    const newCustomer = new this.customerModel({
      ...registerCustomerDto,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      password: hashedPassword,
    });
    return newCustomer.save();
  }
  async getDetailCustomerById(userId: string) {
    return this.customerModel.findById(userId);
  }
  async addFavoriteRestaurant(userId: string, restarantId: string) {
    const customer = await this.customerModel.findById(userId);
    if (!customer) {
      throw new BadRequestException('User not found');
    }
    const restaurantObjectId = new Types.ObjectId(restarantId);
    if (customer.favorite_restaurants.includes(restaurantObjectId)) {
      throw new BadRequestException('Restaurant already in favorite list');
    }
    customer.favorite_restaurants.push(restaurantObjectId);
    return customer.save();
  }
  async removeFavoriteRestaurant(userId: string, restarantId: string) {
    const customer = await this.customerModel.findById(userId);
    if (!customer) {
      throw new BadRequestException('User not found');
    }
    const restaurantObjectId = new Types.ObjectId(restarantId);
    if (
      !customer.favorite_restaurants.some(
        (id) => id.toString() === restaurantObjectId.toString(),
      )
    ) {
      throw new BadRequestException('Restaurant not in favorite list');
    }
    customer.favorite_restaurants = customer.favorite_restaurants.filter(
      (restaurant) => restaurant.toString() !== restaurantObjectId.toString(),
    );
    return customer.save();
  }
  async getFavoriteRestaurants(userId: string) {
    const customer = await this.customerModel
      .findById(userId)
      .populate('favorite_restaurants');
    if (!customer) {
      throw new BadRequestException('User not found');
    }
    return customer.favorite_restaurants;
  }
  async addAddress(userId: string, address: string) {
    const customer = await this.customerModel.findById(userId);
    if (!customer) {
      throw new BadRequestException('User not found');
    }
    customer.address.push(address);
    return customer.save();
  }
  async removeAddress(userId: string, address: string) {
    const customer = await this.customerModel.findById(userId);
    if (!customer) {
      throw new BadRequestException('User not found');
    }
    customer.address = customer.address.filter((item) => item !== address);
    return customer.save();
  }
  async getAddresses(userId: string) {
    const customer = await this.customerModel.findById(userId);
    if (!customer) {
      throw new BadRequestException('User not found');
    }
    return customer.address;
  }
  async getPoints(userId: string) {
    const customer = await this.customerModel.findById(userId);
    if (!customer) {
      throw new BadRequestException('User not found');
    }
    return customer.total_points;
  }
}
