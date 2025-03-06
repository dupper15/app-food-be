import { BadRequestException, HttpException, Injectable } from '@nestjs/common';
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

  async login(loginUserDto: LoginUserDto): Promise<{
    accessToken: string;
    refreshToken: string;
    userType: string;
    message: string;
  }> {
    const { email, password } = loginUserDto;

    // find role user
    // eslint-disable-next-line prefer-const
    let userType = 'customer';

    // check email exist
    const existingUser = await this.userModel.findOne({ email });
    if (!existingUser) {
      throw new BadRequestException('Email not exist! Please try again');
    }

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
      message: 'Login successfully',
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
    await this.mailService.sendVerificationCode(email, code);

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
}
