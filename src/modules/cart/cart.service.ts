import { Inject, Injectable } from '@nestjs/common';
import { Cart } from './cart.schema';
import { Model, Types } from 'mongoose';
import { Dish } from '../dish/dish.schema';
import { OrderItem } from '../order-item/orderItem.schema';

@Injectable()
export class CartService {
  constructor(
    @Inject(Cart.name) private readonly cartModel: Model<Cart>,
    @Inject(Dish.name)
    private readonly dishModel: Model<Dish>,
    @Inject(OrderItem.name) private readonly orderItemModel: Model<OrderItem>,
  ) {}
  async addDish(dishedId: string, userId: string) {
    const dish = await this.dishModel.findById(dishedId);
    if (!dish) {
      throw new Error('Dish not found');
    }
    const user = new Types.ObjectId(userId);
    const restaurantObjectId = dish.restaurant_id;
    const cart = await this.cartModel.findOne({
      user_id: user,
      restaurant_id: dish.restaurant_id,
    });
    const newOrderItem = new this.orderItemModel({
      dish_id: new Types.ObjectId(dish._id),
      quantity: 1,
    });
    await newOrderItem.save();
    if (cart) {
      await this.cartModel.updateOne(
        { _id: cart._id },
        { $push: { order_items: newOrderItem._id } },
      );
    } else {
      const newCart = new this.cartModel({
        user_id: user,
        restaurant_id: restaurantObjectId,
        order_items: [newOrderItem],
      });
      await newCart.save();
    }
  }
  async getOrdersByUserId(userId: string) {
    const user = new Types.ObjectId(userId);
    const carts = await this.cartModel
      .find({ customer_id: user })
      .populate('order_items')
      .populate('restaurant_id');
    return carts;
  }
}
