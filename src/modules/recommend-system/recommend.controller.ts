import { Controller, Get, Param } from '@nestjs/common';
import { RecommendService } from './recommend.service';
import { InjectModel } from '@nestjs/mongoose';
import { Order } from '../order/order.schema';
import { Model } from 'mongoose';

@Controller('recommend')
export class RecommendController {
  constructor(
    @InjectModel(Order.name) private readonly orderModel: Model<Order>,
    private readonly recommendService: RecommendService,
  ) {}

  @Get(':id')
  async getRecommendRestaurant(@Param('id') customerId: string) {
    const orders = await this.orderModel
      .find({ status: 'Completed', customer_id: customerId })
      .select('customer_id restaurant_id array_item')
      .populate({
        path: 'array_item',
        select: 'dish_id',
        populate: [
          {
            path: 'dish_id',
            select: 'name',
          },
        ],
      })
      .exec();
    const result = await this.recommendService.getRecommendRestaurant(
      customerId,
      orders,
    );
    return { result };
  }
}
