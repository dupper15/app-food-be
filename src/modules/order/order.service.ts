import { BadRequestException, Injectable } from '@nestjs/common';import { InjectModel } from '@nestjs/mongoose';
import { Order } from './order.schema';
import { Model, ObjectId, Types } from 'mongoose';
import { CreateOrderDto } from './dto/createOrder.dto';
import { Voucher } from '../voucher/voucher.schema';
import { Customer } from '../customer/customer.schema';
import { OrderItem } from '../order-item/orderItem.schema';
import { Cart } from '../cart/cart.schema';

@Injectable()
export class OrderService {
  constructor(
    @InjectModel(Order.name) private readonly orderModel: Model<Order>,
    @InjectModel(Voucher.name) private readonly voucherModel: Model<Voucher>,
    @InjectModel(Customer.name) private readonly customerModel: Model<Customer>,
    @InjectModel(OrderItem.name)
    private readonly orderItemModel: Model<OrderItem>,
    @InjectModel(Cart.name) private readonly cartModel: Model<Cart>,
  ) {}

  async createOrder(createOrderDto: CreateOrderDto): Promise<Order> {
    const newOrder = new this.orderModel(createOrderDto);
    const customer = await this.customerModel.findById(
      createOrderDto.customer_id,
    );
    if (!customer) {
      throw new BadRequestException('Customer not found');
    }
    if (createOrderDto.used_point > 0) {
      if (customer.total_points < createOrderDto.used_point) {
        throw new BadRequestException('Not enough points');
      }
      customer.total_points -= createOrderDto.used_point;
    }
    customer.total_points += Math.floor(createOrderDto.total_price / 100000);
    await customer.save();
    if (createOrderDto.voucher_id) {
      const voucher = await this.voucherModel.findById(
        createOrderDto.voucher_id,
      );
      if (!voucher) {
        throw new BadRequestException('Voucher not found');
      }
      if (voucher.quantity <= 0) {
        throw new BadRequestException('Voucher is no longer available');
      }
      voucher.quantity -= 1;
      if (voucher.quantity === 0) {
        await this.voucherModel.findByIdAndUpdate(
          createOrderDto.voucher_id,
          { is_exhausted: true },
          { new: true },
        );
      } else {
        await voucher.save();
      }
    }
    for (const element of createOrderDto.array_item) {
      await this.orderItemModel.findByIdAndUpdate(
        element._id,
        {
          is_paid: true,
        },
        { new: true },
      );
    }
    const restaurantObjectId = new Types.ObjectId(createOrderDto.restaurant_id);
    const userObjectId = new Types.ObjectId(createOrderDto.customer_id);
    const cart = await this.cartModel.findOne({
      restaurant_id: restaurantObjectId,
      user_id: userObjectId,
    });
    if (!cart) {
      throw new BadRequestException('Cart not found');
    }
    await Promise.all(
      createOrderDto.array_item.map(async (element) => {
        await cart.updateOne({
          $pull: { order_items: element },
        });
      }),
    );
    await cart.save();
    const updatedCart = await this.cartModel.findById(cart._id);
    if (!updatedCart) {
      throw new BadRequestException('Cart not found');
    }
    if (updatedCart.order_items.length == 0) {
      await this.cartModel.findByIdAndDelete(cart._id);
    }
    return await newOrder.save();
  }

  async reOrder(orderId: ObjectId): Promise<Order> {
    const order = await this.orderModel.findById(orderId).exec();
    if (!order) {
      throw new BadRequestException('No found order');
    }
    order.status = 'Pending';
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
