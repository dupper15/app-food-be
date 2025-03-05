import { BadRequestException, HttpException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './user.schema';
import { Model } from 'mongoose';
import { RegisterUserDto } from './dto/register.dto';
import * as bcrypt from 'bcrypt';
import { LoginUserDto } from './dto/login.dto';
import { JwtService } from 'src/jwt/jwt.service';
import { MailService } from 'src/mailer/mail.service';

@Injectable()
export class UserService<T extends User> {
  constructor(
    @InjectModel(User.name) protected readonly userModel: Model<T>,
    protected readonly jwtService: JwtService,
    protected readonly mailService: MailService,
  ) {}

  async register(registerUserDto: RegisterUserDto): Promise<T> {
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
    const hashedPassword = await bcrypt.hash(password, 10);

    // create new user
    const newUser = new this.userModel({
      ...registerUserDto,
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
    const userType = 'customer';

    // check email exist
    const existingUser = await this.userModel.findOne({ email });
    if (!existingUser) {
      throw new BadRequestException('Email not exist! Please try again');
    }

    // check password
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

  async logout(): Promise<{ message: string }> {
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
