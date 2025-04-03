import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Voucher, VoucherDocument } from './voucher.schema';

@Injectable()
export class VoucherService {
  constructor(
    @InjectModel(Voucher.name) private voucherModel: Model<VoucherDocument>,
  ) {}

  async createVoucher(data: Partial<Voucher>): Promise<Voucher> {
    return this.voucherModel.create(data);
  }

  async fetchSystemVouchers(): Promise<Voucher[]> {
    return this.voucherModel.find().exec();
  }

  async fetchAvailableVouchers(restaurantId: string): Promise<Voucher[]> {
    return this.voucherModel
      .find({
        $or: [
          { restaurant_id: restaurantId },
          { restaurant_id: { $exists: false } },
        ],
        quantity: { $gt: 0 },
        expire_date: { $gte: new Date() },
        is_exhausted: false,
      })
      .exec();
  }

  async getVoucherById(id: string): Promise<Voucher> {
    const voucher = await this.voucherModel.findById(id).exec();
    if (!voucher) {
      throw new Error('Voucher not found');
    }
    return voucher;
  }
}
