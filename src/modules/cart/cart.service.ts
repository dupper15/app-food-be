import { BadRequestException, Injectable } from '@nestjs/common';
import { Cart } from './cart.schema';
import { Model, Types } from 'mongoose';
import { Dish } from '../dish/dish.schema';
import { OrderItem } from '../order-item/orderItem.schema';
import { OrderItemService } from './../order-item/orderItem.service';
import { CreateOrderItemDto } from '../order-item/dto/createOrderItem.dto';
import { InjectModel } from '@nestjs/mongoose';
@Injectable()
export class CartService {
  constructor(
    @InjectModel(Cart.name) private readonly cartModel: Model<Cart>,
    @InjectModel(Dish.name)
    private readonly dishModel: Model<Dish>,
    @InjectModel(OrderItem.name)
    private readonly orderItemModel: Model<OrderItem>,
    private readonly orderItemService: OrderItemService,
  ) {}
  async addDish(createOrderItemDto: CreateOrderItemDto, userId: string) {
    const user = new Types.ObjectId(userId);
    createOrderItemDto.user_id = user;
    console.log('createOrderItemDto', createOrderItemDto);
    const dish = await this.dishModel.findById(createOrderItemDto.dish_id);
    if (!dish) {
      throw new Error('Dish not found');
    }

    const dishId = new Types.ObjectId(createOrderItemDto.dish_id);
    createOrderItemDto.dish_id = dishId;
    const newOrderItem =
      await this.orderItemService.createOrderItem(createOrderItemDto);

    const restaurantObjectId = new Types.ObjectId(
      // eslint-disable-next-line @typescript-eslint/no-base-to-string
      dish.restaurant_id.toString(),
    );
    const cart = await this.cartModel.findOne({
      user_id: user,
      restaurant_id: restaurantObjectId,
    });

    if (cart) {
      return this.cartModel.findByIdAndUpdate(
        cart._id,
        { $push: { order_items: newOrderItem._id } },
        { new: true },
      );
    } else {
      const newCart = new this.cartModel({
        user_id: user,
        restaurant_id: restaurantObjectId,
        order_items: [newOrderItem._id],
      });
      return await newCart.save();
    }
  }

  async getOrdersByUserId(userId: string) {
    const user = new Types.ObjectId(userId);
    const carts = await this.cartModel
      .find({ user_id: user })
      .populate({
        path: 'order_items',
        match: { is_paid: false },
        populate: [
          {
            path: 'dish_id',
            select: 'name price image time isAvailable restaurant_id',
          },
          { path: 'topping', select: 'name price' },
        ],
      })
      .populate('restaurant_id', 'name')
      .lean()
      .exec();

    return carts;
  }
  async deleteOrderItem(userId: string, orderItemId: string) {
    const cart = await this.cartModel.findOne({
      user_id: new Types.ObjectId(userId),
      order_items: { $in: [new Types.ObjectId(orderItemId)] },
    });

    if (!cart) {
      throw new Error('Cart not found');
    }
    const deletedOrderItem =
      await this.orderItemModel.findByIdAndDelete(orderItemId);
    if (!deletedOrderItem) {
      throw new Error('Order item not found');
    }
    await this.cartModel.updateOne(
      { _id: cart._id },
      { $pull: { order_items: new Types.ObjectId(orderItemId) } },
    );

    const updatedCart = await this.cartModel.findById(cart._id);
    if (!updatedCart) {
      throw new BadRequestException('Cart not found after update');
    }

    if (updatedCart.order_items.length === 0) {
      await this.cartModel.findByIdAndDelete(cart._id);
    }

    return { msg: 'Order item deleted successfully' };
  }
}
