import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { History, HistoryDocument } from './history.schema';
import { CreateHistoryDto } from './dto/createHistory';

@Injectable()
export class HistoryService {
  constructor(
    @InjectModel(History.name) private historyModel: Model<HistoryDocument>,
  ) {}

  async createHistory(createHistoryDto: CreateHistoryDto): Promise<History> {
    return await this.historyModel.create(createHistoryDto);
  }

  async fetchAllHistoryByCustomer(customerId: string): Promise<History[]> {
    return this.historyModel.find({ customer_id: customerId }).exec();
  }

  async fetchDetailHistoryByCustomer(id: string): Promise<History> {
    const history = await this.historyModel.findById(id).exec();
    if (history === null) {
      throw new Error('History not found');
    }
    return history;
  }

  async fetchDetailHistoryByRestaurant(id: string): Promise<History> {
    const history = await this.historyModel
      .findById(id)
      .populate({
        path: 'order_id',
        select: 'status restaurant_id array_item voucher_id used_point',
        populate: [
          {
            path: 'array_item',
            select: 'dish_id quantity topping',
            populate: [
              { path: 'dish_id', select: 'name price' },
              { path: 'topping', select: 'name price' },
            ],
          },
          {
            path: 'voucher_id',
            select: 'value',
          },
        ],
      })
      .populate({
        path: 'customer_id',
        select: 'name avatar',
      })
      .lean() // Optional: nếu bạn muốn lấy plain object thay vì Document
      .exec();

    if (!history) {
      throw new NotFoundException('History not found');
    }

    return history;
  }

  async fetchAllHistorySuccessByRestaurant(id: string): Promise<History[]> {
    const histories = await this.historyModel
      .find()
      .populate({
        path: 'order_id',
        match: {
          restaurant_id: id,
          status: 'Completed',
        },
        select: 'status restaurant_id',
      })
      .populate({ path: 'customer_id', select: 'name avatar' })
      .lean()
      .exec();

    console.log('histories', histories);

    return histories.filter((h) => h.order_id);
  }

  async fetchAllHistoryFailedByRestaurant(id: string): Promise<History[]> {
    const histories = await this.historyModel
      .find()
      .populate({
        path: 'order_id',
        match: {
          restaurant_id: id,
          status: 'Cancel',
        },
        select: 'status restaurant_id',
      })
      .populate({ path: 'customer_id', select: 'name avatar' })
      .lean()
      .exec();

    console.log('histories', histories);

    return histories.filter((h) => h.order_id);
  }
}
