import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Customer } from '../customer/customer.schema';
import { RestaurantOwner } from '../restaurant-owner/restaurant-owner.schema';
import { Vonage } from '@vonage/server-sdk';
import { Auth } from '@vonage/auth';
import * as bcrypt from 'bcrypt';

@Injectable()
export class SmsService {
  private vonage: Vonage;

  constructor(
    @InjectModel(Customer.name) private readonly customer: Model<Customer>,
    @InjectModel(RestaurantOwner.name)
    private readonly restaurantOwner: Model<any>,
  ) {
    this.vonage = new Vonage(
      new Auth({
        apiKey: process.env.VONAGE_API_KEY || 'no_key',
        apiSecret: process.env.VONAGE_API_SECRET || 'no_secret',
      }),
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
      if (restaurantOwner.verified_code.toString() !== code.toString) {
        throw new Error('Invalid verification code');
      }
      restaurantOwner.is_verified = true;
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
    const from = process.env.VONAGE_BRAND_NAME || 'NestApp';
    const customer = await this.customer.findById(id);
    const restaurantOwner = await this.restaurantOwner.findById(id);
    const code: number = Math.floor(1000 + Math.random() * 9000);
    const codeStr: string = code.toString();
    if (!customer && !restaurantOwner) {
      throw new Error('User not found');
    }

    if (customer) {
      customer.verified_code = code;
      customer.code_expired = new Date(Date.now() + 5 * 60 * 1000);
      await customer.save();
    } else if (restaurantOwner) {
      restaurantOwner.verified_code = code;
      restaurantOwner.code_expired = new Date(Date.now() + 5 * 60 * 1000);
      await restaurantOwner.save();
    }

    try {
      // const response = await this.vonage.sms.send({
      //   to,
      //   from,
      //   text: `Your verification code is ${code}. It will expire in 5 minutes.`,
      // });

      // Kiểm tra trạng thái của tin nhắn
      // if (response.messages[0].status !== '0') {
      //   throw new Error(`Vonage error: ${response.messages[0]['error-text']}`);
      // }

      // return response;
      console.log('Sending SMS...', code);
      return {
        message: `Your verification code is ${code}. It will expire in 5 minutes.`,
        status: 'success',
      };
    } catch (error) {
      console.error('Vonage SMS error:', error);
      throw error;
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
