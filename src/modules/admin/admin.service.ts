import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Admin } from './admin.schema';
import * as bcrypt from 'bcrypt';
import { Model } from 'mongoose';

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(Admin.name)
    protected readonly adminModel: Model<Admin>,
  ) {}
  async registerAdmin(data: {
    email: string;
    password: string;
    confirmPassword: string;
  }): Promise<Admin> {
    const { email, password, confirmPassword } = data;

    if (!email || !password || !confirmPassword) {
      throw new BadRequestException('Missing required fields');
    }

    if (password !== confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newAdmin = new this.adminModel({
      email,
      password: hashedPassword,
    });

    return await newAdmin.save();
  }

  async loginAdmin(data: {
    email: string;
    password: string;
  }): Promise<{ status: string }> {
    const { email, password } = data;

    if (!email || !password) {
      throw new Error('Thiếu email hoặc mật khẩu');
    }

    // 2. Tìm admin theo email
    const admin = await this.adminModel.findOne({ email });
    if (!admin) {
      throw new Error('Tài khoản không tồn tại');
    }

    // 3. So sánh mật khẩu
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      throw new Error('Mật khẩu không đúng');
    }

    // 4. Thành công
    return { status: 'success' };
  }
}
