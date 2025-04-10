import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { RestaurantOwner } from './restaurant-owner.schema';
import { UserService } from '../user/user.service';
import { Model, Types } from 'mongoose';
import { JwtService } from 'src/jwt/jwt.service';
import { MailService } from 'src/mailer/mail.service';
import { RegisterRestaurantDto } from './dto/register-restaurant.dto';
import * as bcrypt from 'bcrypt';
import { Customer } from '../customer/customer.schema';
import { Admin } from '../admin/admin.schema';
@Injectable()
export class RestaurantOwnerService extends UserService<RestaurantOwner> {
  constructor(
    @InjectModel(RestaurantOwner.name)
    protected readonly restaurantOwnerModel: Model<RestaurantOwner>,
    protected readonly jwtService: JwtService,
    protected readonly mailService: MailService,
    @InjectModel(Customer.name)
    protected readonly customerModel: Model<Customer>,
    @InjectModel(Admin.name) protected readonly adminModel: Model<Admin>,
  ) {
    super(
      restaurantOwnerModel,
      restaurantOwnerModel,
      customerModel,
      adminModel,
      jwtService,
      mailService,
    );
  }
  async register(
    registerRestaurantOwnerDto: RegisterRestaurantDto,
  ): Promise<RestaurantOwner> {
    const { email, password, confirmPassword } = registerRestaurantOwnerDto;
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
    const newRestaurantOwner = new this.restaurantOwnerModel({
      ...registerRestaurantOwnerDto,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      password: hashedPassword,
    });
    return newRestaurantOwner.save();
  }
  async edit(id: string, data: any): Promise<RestaurantOwner> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid ID format');
    }
    const objectId = new Types.ObjectId(id);
    const restaurantOwner = await this.restaurantOwnerModel.findById(objectId);
    if (!restaurantOwner) {
      throw new BadRequestException('Restaurant owner not found');
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (data.password) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      const salt = await bcrypt.genSalt(10);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
      data.password = await bcrypt.hash(data.password, salt);
    }

    const updatedRestaurantOwner =
      await this.restaurantOwnerModel.findByIdAndUpdate(
        objectId,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        { $set: data },
        { new: true },
      );

    if (!updatedRestaurantOwner) {
      throw new BadRequestException('Failed to update restaurant owner');
    }

    return updatedRestaurantOwner;
  }
  async fetchDetailOwner(id: string): Promise<RestaurantOwner> {
    const owner = await this.restaurantOwnerModel.findById(id);
    if (!owner) {
      throw new NotFoundException('User not found');
    }
    return owner;
  }
}
