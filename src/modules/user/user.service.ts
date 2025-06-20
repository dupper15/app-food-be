import {
  BadRequestException,
  HttpException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './user.schema';
import { Model } from 'mongoose';
import { RegisterUserDto } from './dto/register.dto';
import * as bcrypt from 'bcrypt';
import { LoginUserDto } from './dto/login.dto';
import { JwtService } from 'src/jwt/jwt.service';
import { MailService } from 'src/mailer/mail.service';
import { RestaurantOwner } from '../restaurant-owner/restaurant-owner.schema';
import { Customer } from '../customer/customer.schema';
import { Admin } from '../admin/admin.schema';
import { OAuth2Client } from 'google-auth-library';
import { CreateAdminDto } from './dto/createAdmin.dto';

@Injectable()
export class UserService<T extends User> {
  constructor(
    @InjectModel(User.name) protected readonly userModel: Model<T>,
    @InjectModel(RestaurantOwner.name)
    protected readonly restaurantOwnerModel: Model<RestaurantOwner>,
    @InjectModel(Customer.name)
    protected readonly customerModel: Model<Customer>,
    @InjectModel(Admin.name) protected readonly adminModel: Model<Admin>,
    protected readonly jwtService: JwtService,
    protected readonly mailService: MailService,
  ) {}

  async checkUser(email: string): Promise<boolean> {
    const [customerExist, adminExist, restaurantOwnerExist] = await Promise.all(
      [
        this.customerModel.findOne({ email }).exec(),
        this.adminModel.findOne({ email }).exec(),
        this.restaurantOwnerModel.findOne({ email }).exec(),
      ],
    );
    return customerExist || adminExist || restaurantOwnerExist ? true : false;
  }
  async register(registerUserDto: RegisterUserDto): Promise<User> {
    const { email, password, confirmPassword } = registerUserDto;

    // check email exist
    const existingUser = await this.userModel.findOne({ email });
    if (existingUser) {
      throw new BadRequestException('Email exist! Please try again');
    }

    // check password
    if (password !== confirmPassword) {
      throw new BadRequestException('Password not match! Please try again');
    }

    // hash password
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const hashedPassword = await bcrypt.hash(password, 10);

    // create new user
    const newUser = new this.userModel({
      ...registerUserDto,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      password: hashedPassword,
    });

    return newUser.save();
  }

  async googleLogin(idToken: string): Promise<any> {
    const client: any = new OAuth2Client(process.env.GOOGLE_CLIENT_ID || 'no');

    const ticket: any = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const customer = await this.customerModel
      .findOne({ email: payload.email })
      .exec();
    if (customer) {
      const accessToken = this.jwtService.generateAccessToken(payload);
      const refreshToken = this.jwtService.generateRefreshToken(payload);

      return {
        accessToken: accessToken,
        refreshToken: refreshToken,
        userType: 'customer',
        status: customer.status,
        message: 'Login successfully',
        total_time_spent: customer.total_time_spent,
        isVerified: customer.isVerified,
      };
    } else {
      const password = 'googleLogin';
      return this.customerModel.create({
        email: payload.email,
        name: payload.name || '',
        avatar: payload.picture || '',
        password,
        isVerified: true,
        total_logins: 1,
        total_orders: 0,
        total_time_spent: 0,
        last_login: new Date(),
        isDeleted: false,
        address: [],
        addressCoordinates: [],
        phone: '',
        history: [],
        cart: [],
        favorite_restaurants: [],
        total_points: 0,
      });
    }
  }
  async login(loginUserDto: LoginUserDto): Promise<{
    accessToken: string;
    refreshToken: string;
    userType: string;
    message: string;
    total_time_spent: number;
    isVerified: boolean;
    status: string;
  }> {
    const { email, password } = loginUserDto;
    let isVerified = true;
    // find role user
    let userType = 'customer';
    let existingUser;
    const existingCustomer = await this.customerModel.findOne({ email });
    if (existingCustomer) {
      existingUser = existingCustomer;
      isVerified = existingCustomer.isVerified;
      userType = 'customer';
      await this.customerModel.findByIdAndUpdate(existingCustomer._id, {
        expo_push_token: loginUserDto.expo_push_token,
      });
    }
    const existingAdmin = await this.adminModel.findOne({ email });
    if (existingAdmin) {
      existingUser = existingAdmin;
      userType = 'admin';
    }
    const existingRestaurantOwner = await this.restaurantOwnerModel.findOne({
      email,
    });
    if (existingRestaurantOwner) {
      isVerified = existingRestaurantOwner.isVerified;
      existingUser = existingRestaurantOwner;
      userType = 'restaurantOwner';
      await this.restaurantOwnerModel.findByIdAndUpdate(
        existingRestaurantOwner._id,
        {
          expo_push_token: loginUserDto.expo_push_token,
        },
      );
    }
    if (!existingCustomer && !existingAdmin && !existingRestaurantOwner) {
      throw new BadRequestException('Email not exist! Please try again');
    }
    existingUser.total_logins++;
    await existingUser.save();
    // check password
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const isPasswordMatch = await bcrypt.compare(
      password,
      existingUser.password,
    );
    if (!isPasswordMatch) {
      throw new BadRequestException('Password not match! Please try again');
    }

    //create payload and token
    const payload = {
      _id: existingUser._id,
      email: existingUser.email,
    };

    const accessToken = this.jwtService.generateAccessToken(payload);
    const refreshToken = this.jwtService.generateRefreshToken(payload);

    return {
      accessToken: accessToken,
      refreshToken: refreshToken,
      userType: userType,
      status: existingUser.status,
      message: 'Login successfully',
      total_time_spent: existingUser.total_time_spent,
      isVerified: isVerified,
    };
  }

  logout(): { message: string } {
    return { message: 'Logout successfully' };
  }

  async sendCode(email: string): Promise<{ message: string }> {
    const user = await this.userModel.findOne({ email });
    if (!user) {
      throw new HttpException('Email not found', 404);
    }

    const code = Math.floor(1000 + Math.random() * 9000);

    user.verified_code = code;
    user.code_expired = new Date(Date.now() + 5 * 60 * 1000);

    await user.save();

    //send code
    //await this.mailService.sendVerificationCode(email, code);
    console.log('code', code);
    return { message: 'Code sent successfully' };
  }

  async verifiedCode(
    email: string,
    verified_code: number,
  ): Promise<{ message: string }> {
    const user = await this.userModel.findOne({ email });
    if (!user) {
      throw new HttpException('Email not found', 404);
    }

    //check code
    if (user.verified_code !== verified_code) {
      throw new HttpException('Code not match', 400);
    }

    //check expire
    if (user.code_expired < new Date()) {
      throw new HttpException('Code expired', 400);
    }

    user.isVerified = true;
    await user.save();

    return { message: 'Verified successfully' };
  }
  async deleteUser(id: string): Promise<{ message: string }> {
    const user = await this.userModel.findByIdAndDelete(id);
    if (!user) {
      throw new HttpException('User not found', 404);
    }
    return { message: 'Delete user successfully' };
  }
  async fetchDetailUser(id: string): Promise<User> {
    const user = await this.userModel.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }
  async changePassword(id: string, data): Promise<{ message: string }> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const { currentPassword, newPassword, confirmPassword } = data;
    if (newPassword !== confirmPassword) {
      throw new BadRequestException('New password not match! Please try again');
    }
    const userRoles: (
      | Model<Admin>
      | Model<Customer>
      | Model<RestaurantOwner>
    )[] = [this.adminModel, this.customerModel, this.restaurantOwnerModel];

    let account: any = null;

    for (const model of userRoles) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      account = await (model as Model<User>).findById(id);
      if (account) break;
    }

    if (!account) {
      throw new BadRequestException('Account not found');
    }

    const isPasswordMatch = await bcrypt.compare(
      currentPassword,
      account.password,
    );
    if (!isPasswordMatch) {
      throw new BadRequestException(
        'Current password not match! Please try again',
      );
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    account.password = hashedPassword;
    await account.save();

    return { message: 'Change password successfully' };
  }
  async updateUsageTime(
    id: string,
    data: { total_time_spent: number },
  ): Promise<{ message: string }> {
    const { total_time_spent } = data;

    // Kiểm tra xem total_time_spent có hợp lệ không
    if (typeof total_time_spent !== 'number' || total_time_spent < 0) {
      throw new BadRequestException('Invalid total_time_spent value');
    }

    // Mảng các model người dùng có total_time_spent
    const userRoles: (
      | Model<Admin>
      | Model<Customer>
      | Model<RestaurantOwner>
    )[] = [this.adminModel, this.customerModel, this.restaurantOwnerModel];

    let account: any = null;

    for (const model of userRoles) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      account = await (model as Model<User>).findById(id);
      if (account) break;
    }

    if (!account) {
      throw new BadRequestException('Account not found');
    }

    // Cập nhật total_time_spent cho tài khoản tìm thấy
    account.total_time_spent = total_time_spent;
    await account.save();
    return { message: `Update usage time successfully` };
  }

  async fetchAllUser(
    page: number,
    limit: number,
    filter: string = 'all',
    q?: string,
  ): Promise<{ data: (Admin | Customer | RestaurantOwner)[]; total: number }> {
    const skip = (page - 1) * limit;
    let admins: any[] = [];
    let customers: any[] = [];
    let owners: any[] = [];

    const searchCondition = q ? { name: { $regex: q, $options: 'i' } } : {};

    if (filter === 'all' || filter === 'admin') {
      admins = await this.adminModel.find(searchCondition).lean().exec();
    }
    if (filter === 'all' || filter === 'customer') {
      customers = await this.customerModel.find(searchCondition).lean().exec();
    }
    if (filter === 'all' || filter === 'owner') {
      owners = await this.restaurantOwnerModel
        .find(searchCondition)
        .lean()
        .exec();
    }

    const allUsers = [
      ...admins.map((a) => ({ ...a, role: 'Admin' })),
      ...customers.map((c) => ({ ...c, role: 'Customer' })),
      ...owners.map((o) => ({ ...o, role: 'Restaurant owner' })),
    ];
    const total = allUsers.length;

    if (allUsers.length === 0) {
      throw new NotFoundException('No users found');
    }

    const paginated = allUsers.slice(skip, skip + limit);

    return {
      data: paginated,
      total,
    };
  }

  async changeUserStatus(id: string): Promise<{ message: string }> {
    const userRoles: (
      | Model<Admin>
      | Model<Customer>
      | Model<RestaurantOwner>
    )[] = [this.adminModel, this.customerModel, this.restaurantOwnerModel];

    let account: any = null;

    for (const model of userRoles) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      account = await (model as Model<User>).findById(id);
      if (account) break;
    }

    if (!account) {
      throw new BadRequestException('Account not found');
    }
    if (account.status === 'Enable') {
      account.status = 'Disable';
    } else {
      account.status = 'Enable';
    }
    await account.save();

    return { message: `User status changed to ${account.status} successfully` };
  }

  async createAdmin(data: CreateAdminDto): Promise<Admin> {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    const adminData: CreateAdminDto = {
      ...data,
      password: hashedPassword,
    };

    const newAdmin = await this.adminModel.create(adminData);
    return newAdmin;
  }
}
