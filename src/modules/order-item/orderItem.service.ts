import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { OrderItem } from './orderItem.schema';
import { Model, ObjectId } from 'mongoose';
import { CreateOrderItemDto } from './dto/createOrderItem.dto';

@Injectable()
export class OrderItemService {
  constructor(
    @InjectModel(OrderItem.name)
    private readonly orderItemModel: Model<OrderItem>,
  ) {}

  async createOrderItem(
    createOrderItemDto: CreateOrderItemDto,
  ): Promise<OrderItem> {
    const newOrderItem = new this.orderItemModel(createOrderItemDto);
    return newOrderItem.save();
  }

  async deleteOrderItem(id: ObjectId): Promise<{ msg: string }> {
    const orderItem = await this.orderItemModel.findById(id).exec();
    if (!orderItem) {
      throw new BadRequestException('No found order item');
    }
    await this.orderItemModel.findByIdAndDelete(id);
    return { msg: 'Order item deleted successfully' };
  }
}
