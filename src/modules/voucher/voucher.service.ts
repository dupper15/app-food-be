import { Injectable } from '@nestjs/common';import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Voucher, VoucherDocument } from './voucher.schema';
import { CreateVoucherDto } from './dto/create-voucher.dto';
import { EditVoucherDto } from './dto/edit-voucher.dto';

@Injectable()
export class VoucherService {
  constructor(
    @InjectModel(Voucher.name) private voucherModel: Model<VoucherDocument>,
  ) {}

  async createVoucher(data: CreateVoucherDto): Promise<Voucher> {
    return this.voucherModel.create(data);
  }

  async editVoucher(id: string, data: EditVoucherDto): Promise<Voucher | null> {
    return await this.voucherModel.findByIdAndUpdate(id, data, { new: true });
  }

  async deleteVoucher(id: string): Promise<Voucher | null> {
    return await this.voucherModel.findByIdAndDelete(id);
  }

  async fetchSystemVouchers(): Promise<Voucher[]> {
    return this.voucherModel.find({ restaurant_id: null }).exec();
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
      })
      .exec();
  }

  async fetchAllVoucher(restaurantId: string): Promise<Voucher[]> {
    return this.voucherModel.find({ restaurant_id: restaurantId });
  }

  async getVoucherById(id: string): Promise<Voucher> {
    const voucher = await this.voucherModel.findById(id).exec();
    if (!voucher) {
      throw new Error('Voucher not found');
    }
    return voucher;
  }
}
