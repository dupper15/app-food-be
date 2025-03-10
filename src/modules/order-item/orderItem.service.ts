import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { OrderItem } from './orderItem.schema';
import { Model, ObjectId } from 'mongoose';
import { CreateOrderItemDto } from './dto/createOrderItem.dto';
import { Types } from 'mongoose';
@Injectable()
export class OrderItemService {
  constructor(
    @InjectModel(OrderItem.name)
    private readonly orderItemModel: Model<OrderItem>,
  ) {}

  async createOrderItem(createOrderItemDto: CreateOrderItemDto) {
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

  async increaseQuantity(id: ObjectId): Promise<OrderItem> {
    const orderItem = await this.orderItemModel.findById(id).exec();
    if (!orderItem) {
      throw new BadRequestException('No found order item');
    }
    orderItem.quantity += 1;
    return orderItem.save();
  }

  async decreaseQuantity(id: ObjectId): Promise<any> {
    const orderItem = await this.orderItemModel
      .findOneAndUpdate(
        { _id: id, quantity: { $gt: 1 } },
        { $inc: { quantity: -1 } },
        { new: true },
      )
      .exec();

    if (orderItem) {
      return orderItem;
    }
    const deletedItem = await this.orderItemModel.findByIdAndDelete(id).exec();
    if (deletedItem) {
      return { msg: 'Order item deleted successfully' };
    }

    throw new BadRequestException('No found order item');
  }
  async addTopping(
    id: ObjectId,
    list_topping: Types.ObjectId[],
  ): Promise<OrderItem> {
    const orderItem = await this.orderItemModel.findById(id).exec();
    if (!orderItem) {
      throw new BadRequestException('No found order item');
    }
    orderItem.topping_array = list_topping;
    return orderItem.save();
  }
  async fetchAllOrderItemByListId(listId: ObjectId[]): Promise<OrderItem[]> {
    const orderItems = await this.orderItemModel
      .find({ _id: { $in: listId } })
      .exec();
    return orderItems;
  }
}
