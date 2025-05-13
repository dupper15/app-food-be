import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { OrderItem } from './orderItem.schema';
import { Model, ObjectId, Types } from 'mongoose';
import { CreateOrderItemDto } from './dto/createOrderItem.dto';
import { EditOrderItemDto } from './dto/editOrderItem.dto';
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

  async editOrderItem(id: ObjectId, editOrderItem: EditOrderItemDto) {
    const orderItem = await this.orderItemModel.findByIdAndUpdate(
      id,
      editOrderItem,
      {
        new: true,
        runValidators: true,
      },
    );
    if (!orderItem) {
      throw new BadRequestException('No found order item');
    }
    return orderItem;
  }

  async fetchAllOrderItemByListId(listId: ObjectId[]): Promise<OrderItem[]> {
    const orderItems = await this.orderItemModel
      .find({ _id: { $in: listId } })
      .exec();
    return orderItems;
  }

  async getOrderItem(userId: ObjectId, dishId: ObjectId): Promise<OrderItem> {
    const user_id = new Types.ObjectId(userId.toString());
    const dish_id = new Types.ObjectId(dishId.toString());
    const orderItem = await this.orderItemModel
      .findOne({ user_id, dish_id, is_paid: false })
      .populate('topping')
      .exec();
    if (!orderItem) {
      throw new BadRequestException('No found order item');
    }
    return orderItem;
  }
}
