import { Injectable } from '@nestjs/common';
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
    const newOrderItem =
      await this.orderItemService.createOrderItem(createOrderItemDto);
    const dish = await this.dishModel.findById(createOrderItemDto.dish_id);
    if (!dish) {
      throw new Error('Dish not found');
    }
    const user = new Types.ObjectId(userId);
    const restaurantObjectId = dish.restaurant_id;
    const cart = await this.cartModel.findOne({
      user_id: user,
      restaurant_id: dish.restaurant_id,
    });

    if (cart) {
      return this.cartModel.updateOne(
        { _id: cart._id },
        { $push: { order_items: newOrderItem._id } },
      );
    } else {
      const newCart = new this.cartModel({
        user_id: user,
        restaurant_id: restaurantObjectId,
        order_items: [newOrderItem._id],
      });
      return newCart.save();
    }
  }
  async getOrdersByUserId(userId: string) {
    console.log(userId);
    const user = new Types.ObjectId(userId);
    const carts = await this.cartModel
      .find({ user_id: user })
      .populate('order_items')
      .populate('restaurant_id');
    console.log(carts);
    return carts;
  }
}
