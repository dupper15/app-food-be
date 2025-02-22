import { BadRequestException, Injectable } from '@nestjs/common';import { InjectModel } from '@nestjs/mongoose';
import { User } from './user.schema';
import { Model } from 'mongoose';
import { RegisterUserDto } from './dto/register.dto';
import * as bcrypt from 'bcrypt';
import { IUser } from './user.interface';

@Injectable()
export class UserService<T extends IUser> {
  constructor(@InjectModel(User.name) private readonly userModel: Model<T>) {}

  async register(registerUserDto: Partial<T>): Promise<T> {
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
}
