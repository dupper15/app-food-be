import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Order } from './order.schema';
import { Model, ObjectId } from 'mongoose';
import { CreateOrderDto } from './dto/createOrder.dto';

@Injectable()
export class OrderService {
  constructor(
    @InjectModel(Order.name) private readonly orderModel: Model<Order>,
  ) {}

  async createOrder(creatOrderDto: CreateOrderDto): Promise<Order> {
    const newOrder = new this.orderModel(creatOrderDto);
    return newOrder.save();
  }

  async reOrder(orderId: ObjectId): Promise<Order> {
    const order = await this.orderModel.findById(orderId).exec();
    if (!order) {
      throw new BadRequestException('No found order');
    }
    const newOrder = new this.orderModel(order);
    return newOrder.save();
  }

  async cancelOrder(orderId: ObjectId): Promise<{ msg: string }> {
    const order = await this.orderModel.findById(orderId).exec();
    if (!order) {
      throw new BadRequestException('No found order');
    }
    order.status = 'Cancel';
    await order.save();
    return { msg: 'Cancelled order successfully' };
  }

  async fetchAllOrderByCustomer(customerId: ObjectId): Promise<Order[]> {
    return await this.orderModel.find({ customer_id: customerId }).exec();
  }

  async fetchDetailOrder(orderId: ObjectId): Promise<Order> {
    const order = await this.orderModel.findById(orderId).exec();
    if (!order) {
      throw new BadRequestException('No found order');
    }
    return order;
  }

  async fetchSuccessfullOrderByRestaurant(
    restaurantId: ObjectId,
  ): Promise<Order[]> {
    return await this.orderModel
      .find({ restaurant_id: restaurantId, status: 'Success' })
      .exec();
  }

  async fetchPendingOrderByRestaurant(
    restaurantId: ObjectId,
  ): Promise<Order[]> {
    return await this.orderModel
      .find({ restaurant_id: restaurantId, status: 'Pending' })
      .exec();
  }

  async fetchOngoingOrderByRestaurant(
    restaurantId: ObjectId,
  ): Promise<Order[]> {
    return await this.orderModel
      .find({ restaurant_id: restaurantId, status: 'Ongoing' })
      .exec();
  }

  async fetchCancelledOrderByRestaurant(
    restaurantId: ObjectId,
  ): Promise<Order[]> {
    return await this.orderModel
      .find({ restaurant_id: restaurantId, status: 'Cancel' })
      .exec();
  }
}
