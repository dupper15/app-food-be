import { Injectable } from '@nestjs/common';import { InjectModel } from '@nestjs/mongoose';
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

  async fetchAllHistorySuccessByRestaurant(id: string): Promise<History[]> {
    const histories = await this.historyModel
      .find()
      .populate({ path: 'order_id', select: 'status restaurant_id' })
      .populate({ path: 'customer_id', select: 'name avatar' })
      .exec();

    if (!histories) throw new Error('History not found');

    return histories.filter(
      (history) =>
        history.order_id &&
        String((history.order_id as any).restaurant_id) === String(id) &&
        (history.order_id as any).status === 'completed',
    );
  }

  async fetchAllHistoryFailedByRestaurant(id: string): Promise<History[]> {
    const histories = await this.historyModel
      .find()
      .populate({ path: 'order_id', select: 'status restaurant_id' })
      .populate({ path: 'customer_id', select: 'name avatar' })
      .exec();

    if (!histories) throw new Error('History not found');

    return histories.filter(
      (history) =>
        history.order_id &&
        String((history.order_id as any).restaurant_id) === String(id) &&
        (history.order_id as any).status === 'Cancel',
    );
  }
}
