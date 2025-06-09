import { Injectable } from '@nestjs/common';import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Customer } from '../customer/customer.schema';
import { RestaurantOwner } from '../restaurant-owner/restaurant-owner.schema';
import * as bcrypt from 'bcrypt';
import { Twilio } from 'twilio';
import axios from 'axios';

@Injectable()
export class SmsService {
  private client: Twilio;

  constructor(
    @InjectModel(Customer.name) private readonly customer: Model<Customer>,
    @InjectModel(RestaurantOwner.name)
    private readonly restaurantOwner: Model<RestaurantOwner>,
  ) {
    this.client = new Twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN,
    );
  }
  async verifyAccount(id: string, code: number) {
    console.log(id, code);
    const customer = await this.customer.findById(id);
    const restaurantOwner = await this.restaurantOwner.findById(id);
    if (!customer && !restaurantOwner) {
      throw new Error('User not found');
    }
    if (customer) {
      console.log(customer.verified_code, code);
      if (customer.verified_code?.toString() !== code.toString()) {
        throw new Error('Invalid verification code');
      }
      customer.isVerified = true;
      customer.verified_code = null;
      await customer.save();
    } else if (restaurantOwner) {
      if (restaurantOwner.verified_code?.toString() !== code.toString()) {
        throw new Error('Invalid verification code');
      }
      restaurantOwner.isVerified = true;
      restaurantOwner.verified_code = null;
      await restaurantOwner.save();
    }
  }
  async forgetPassword(
    id: string,
    code: number,
    newPassword: string,
    confirmPassword: string,
  ) {
    if (newPassword !== confirmPassword) {
      throw new Error('Passwords do not match');
    }
    const customer = await this.customer.findById(id);
    const restaurantOwner = await this.restaurantOwner.findById(id);
    if (!customer && !restaurantOwner) {
      throw new Error('User not found');
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    if (customer) {
      if (!customer.verified_code) {
        throw new Error('Verification code not found');
      }
      if (customer.verified_code.toString() !== code.toString()) {
        throw new Error('Invalid verification code');
      }
      customer.password = hashedPassword;
      customer.verified_code = null;
      await customer.save();
    } else if (restaurantOwner) {
      if (!restaurantOwner.verified_code) {
        throw new Error('Verification code not found');
      }
      if (restaurantOwner.verified_code.toString() !== code.toString()) {
        throw new Error('Invalid verification code');
      }
      restaurantOwner.password = hashedPassword;
      restaurantOwner.verified_code = null;
      await restaurantOwner.save();
    }
  }
  async findId(phone: string) {
    const customer = await this.customer.findOne({ phone });
    const restaurantOwner = await this.restaurantOwner.findOne({ phone });
    if (!customer && !restaurantOwner) {
      throw new Error('User not found');
    }
    if (customer) {
      const _id = customer._id;
      if (!_id) {
        throw new Error('User not found');
      }
      const _stringId = _id.toString();
      this.sendSms(phone, _stringId);
      return customer;
    } else if (restaurantOwner) {
      const _id = restaurantOwner._id;
      if (!_id) {
        throw new Error('User not found');
      }
      const _stringId = _id.toString();
      this.sendSms(phone, _stringId);
    }
  }
  async sendSms(to: string, id: string) {
    const code: number = Math.floor(1000 + Math.random() * 9000);

    // Tìm người dùng
    const [customer, restaurantOwner] = await Promise.all([
      this.customer.findById(id),
      this.restaurantOwner.findById(id),
    ]);

    const user = customer || restaurantOwner;
    if (!user) {
      throw new Error('User not found');
    }

    // Cập nhật mã xác thực
    user.verified_code = code;
    user.code_expired = new Date(Date.now() + 5 * 60 * 1000);
    await user.save();

    // Cấu hình gửi SMS
    const apiKey = process.env.ESMS_API_KEY;
    const secretKey = '3A90093CD7CF7006EB44ED2C40A0C2';
    const smsType = 4;
    const message = `Ma xac thuc cua ban la ${code}.`;

    try {
      const response = await axios.get(
        'https://api.esms.vn/MainService.svc/json/SendMultipleMessage_V4_get',
        {
          params: {
            Phone: to,
            Content: message,
            ApiKey: apiKey,
            SecretKey: secretKey,
            SmsType: smsType,
            IsUnicode: 0,
            Sandbox: 0,
          },
        },
      );

      // Trả về kết quả từ eSMS
      return response.data;
    } catch (err) {
      console.error('Gửi SMS thất bại:', err?.response?.data || err.message);
      throw new Error('Gửi SMS thất bại');
    }
  }

  async verifyAccountNoDeleteCode(id: string, code: number) {
    const customer = await this.customer.findById(id);
    const restaurantOwner = await this.restaurantOwner.findById(id);
    if (!customer && !restaurantOwner) {
      throw new Error('User not found');
    }
    if (customer) {
      if (customer.verified_code?.toString() !== code.toString()) {
        throw new Error('Invalid verification code');
      }
    } else if (restaurantOwner) {
      if (restaurantOwner.verified_code?.toString() !== code.toString()) {
        throw new Error('Invalid verification code');
      }
    }
  }
}
