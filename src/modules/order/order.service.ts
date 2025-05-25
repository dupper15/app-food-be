import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Order } from './order.schema';
import { Model, ObjectId, Types } from 'mongoose';
import { CreateOrderDto } from './dto/createOrder.dto';
import { Voucher } from '../voucher/voucher.schema';
import { Customer } from '../customer/customer.schema';
import { OrderItem } from '../order-item/orderItem.schema';
import { Cart } from '../cart/cart.schema';
import { HistoryService } from '../history/history.service';
import { subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { Rating } from '../rating/rating.schema';
import { Restaurant } from '../restaurant/restaurant.schema';
import { NotificationService } from '../notification/notification.service';
import { Notification } from '../notification/notification.schema';

interface PopulatedCustomer {
  _id: ObjectId;
  name: string;
  avatar?: string;
}

interface PopulatedRestaurant {
  _id: ObjectId;
  name: string;
  avatar?: string;
}

@Injectable()
export class OrderService {
  constructor(
    @InjectModel(Order.name) private readonly orderModel: Model<Order>,
    @InjectModel(Voucher.name) private readonly voucherModel: Model<Voucher>,
    @InjectModel(Customer.name) private readonly customerModel: Model<Customer>,
    @InjectModel(OrderItem.name)
    private readonly orderItemModel: Model<OrderItem>,
    @InjectModel(Cart.name) private readonly cartModel: Model<Cart>,
    @InjectModel(Rating.name) private readonly ratingModel: Model<Rating>,
    @InjectModel(Restaurant.name)
    private readonly restaurantModel: Model<Restaurant>,
    @InjectModel(Notification.name)
    private readonly notificationModel: Model<Notification>,

    private readonly historyService: HistoryService,
    private readonly notificationService: NotificationService,
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

  async cancelOrderByRestaurant(id: ObjectId): Promise<{ msg: string }> {
    const order = await this.orderModel
      .findById(id)
      .populate<{ array_item: OrderItem[] }>('array_item')
      .populate<{ customer_id: PopulatedCustomer }>('customer_id', 'name')
      .populate<{ restaurant_id: PopulatedRestaurant }>('restaurant_id', 'name')
      .exec();
    if (!order) {
      throw new BadRequestException('No found order');
    }

    order.status = 'Cancel';
    await order.save();

    const sumDishes = Array.isArray(order.array_item)
      ? order.array_item.reduce(
          (sum: number, item: { quantity?: number }) =>
            sum + (Number(item?.quantity) || 0),
          0,
        )
      : 0;

    // Tạo lịch sử ơn hàng sau khi hủy
    await this.historyService.createHistory({
      order_id: order._id.toString(),
      customer_id: order.customer_id.toString(),
      reason: 'Cancelled by restaurant',
      cost: order.total_price,
      sum_dishes: sumDishes,
    });

    return { msg: 'Cancelled order successfully' };
  }

  async fetchAllOrderByCustomer(customerId: ObjectId): Promise<Order[]> {
    return await this.orderModel.find({ customer_id: customerId }).exec();
  }

  async fetchDetailOrder(orderId: ObjectId): Promise<Order> {
    const order = await this.orderModel
      .findById(orderId)
      .populate('restaurant_id')
      .exec();
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
      .select('customer_id total_price note createdAt')
      .populate({ path: 'customer_id', select: 'name avatar' })
      .populate({
        path: 'array_item',
        select: 'dish_id quantity topping',
        populate: [
          {
            path: 'dish_id',
            select: 'name',
          },
          {
            path: 'topping',
            select: 'name',
          },
        ],
      })
      .exec();
  }

  async fetchOngoingOrderByRestaurant(
    restaurantId: ObjectId,
  ): Promise<Order[]> {
    return await this.orderModel
      .find({
        restaurant_id: restaurantId,
        status: { $nin: ['Pending', 'Completed', 'Cancel'] },
      })
      .select('customer_id total_price note status createdAt')
      .populate({ path: 'customer_id', select: 'name avatar' })
      .populate({
        path: 'array_item',
        select: 'dish_id quantity topping',
        populate: [
          {
            path: 'dish_id',
            select: 'name',
          },
          {
            path: 'topping',
            select: 'name',
          },
        ],
      })
      .exec();
  }

  async fetchCancelledOrderByRestaurant(
    restaurantId: ObjectId,
  ): Promise<Order[]> {
    return await this.orderModel
      .find({ restaurant_id: restaurantId, status: 'Cancel' })
      .exec();
  }
  async fetchSuccessfullOrderByCustomer(
    customerId: ObjectId,
  ): Promise<Order[]> {
    return await this.orderModel
      .find({ customer_id: customerId, status: 'Success' })
      .exec();
  }
  async fetchSuccessfullOrderByCustomerTemp(
    customerId: ObjectId,
  ): Promise<Order[]> {
    return await this.orderModel
      .find({ customer_id: customerId, status: 'Success' })
      .populate({
        path: 'restaurant_id',
        select: 'name avatar',
        populate: {
          path: 'owner_id',
          select: 'avatar _id',
        },
      })
      .populate({
        path: 'voucher_id',
        select: 'value max',
      })
      .populate({
        path: 'array_item',
        select: 'dish_id quantity topping',
        populate: {
          path: 'dish_id',
          select: 'name image time price',
        },
      })
      .select(
        'restaurant_id voucher_id array_item note total_price status time_receive used_point',
      )
      .exec();
  }
  async fetchOngoingOrderByCustomer(customerId: ObjectId): Promise<Order[]> {
    return await this.orderModel
      .find({
        customer_id: customerId,
        $or: [
          { status: 'Pending' },
          { status: 'Received' },
          { status: 'Preparing' },
          { status: 'Ready' },
        ],
      })
      .exec();
  }
  async fetchOngoingOrderByCustomerTemp(
    customerId: ObjectId,
  ): Promise<Order[]> {
    return await this.orderModel
      .find({
        customer_id: customerId,
        $or: [
          { status: 'Pending' },
          { status: 'Received' },
          { status: 'Preparing' },
          { status: 'Ready' },
        ],
      })
      .populate({
        path: 'restaurant_id',
        select: 'name avatar',
        populate: {
          path: 'owner_id',
          select: 'avatar _id',
        },
      })
      .populate({
        path: 'voucher_id',
        select: 'value max',
      })
      .populate({
        path: 'array_item',
        select: 'dish_id quantity topping',
        populate: {
          path: 'dish_id',
          select: 'name image time price',
        },
      })
      .select(
        'restaurant_id voucher_id array_item note total_price status time_receive used_point',
      )
      .exec();
  }

  async updateStatusOrder(id: string): Promise<Order> {
    const order = await this.orderModel.findById(id).exec();
    if (!order) {
      throw new BadRequestException('No found order');
    }

    const customer = await this.customerModel
      .findById(order.customer_id)
      .exec();
    const customerId = (customer as any)?._id.toString();
    const orderId = order._id.toString();

    if (order.status === 'Pending') {
      order.status = 'Received';
      await this.notificationService.sendPushNotification(
        customerId,
        orderId,
        'Your order has been confirmed!',
        `The restaurant has confirmed your order #${orderId}.`,
      );
    } else if (order.status === 'Received') {
      order.status = 'Preparing';
    } else if (order.status === 'Preparing') {
      order.status = 'Ready';
      await this.notificationService.sendPushNotification(
        customerId,
        orderId,
        'Your order is ready!',
        `The restaurant has finished preparing your order #${orderId}. Please pick it up.`,
      );
    } else if (order.status === 'Ready') {
      order.status = 'Completed';

      const sumDishes: number = Array.isArray(order.array_item)
        ? (order.array_item as { quantity?: number }[]).reduce(
            (sum, item) => sum + (Number(item?.quantity) || 0),
            0,
          )
        : 0;
      await this.historyService.createHistory({
        order_id: orderId,
        customer_id: order.customer_id.toString(),
        cost: order.total_price,
        sum_dishes: sumDishes,
      });

      await this.restaurantModel.findByIdAndUpdate(
        order.restaurant_id,
        { $inc: { total_orders: 1 } },
        { new: true },
      );

      const additionalPoints = Math.floor(order.total_price / 100000);
      await this.customerModel.findByIdAndUpdate(
        order.customer_id,
        { $inc: { total_orders: 1, total_points: additionalPoints } },
        { new: true },
      );
    } else {
      throw new BadRequestException('Invalid status update');
    }

    await order.save();

    return order;
  }

  async getOrderedDishesByCustomerId(userId: string) {
    const ratings = await this.ratingModel
      .find({ customer_id: userId })
      .select('order_id rating')
      .exec();

    const orders = await this.orderModel
      .find({ customer_id: userId })
      .populate({
        path: 'array_item',
        populate: {
          path: 'dish_id',
          model: 'Dish',
          select: 'name _id restaurant_id',
        },
      })
      .sort({ createdAt: -1 });

    if (!orders || orders.length === 0) {
      throw new BadRequestException('No order found');
    }

    const dishes: {
      _id: string;
      name: string;
      restaurant_id: string;
      rating: number;
    }[] = [];

    for (const order of orders) {
      const ratingRecord = ratings.find(
        (r) => r.order_id.toString() === order._id.toString(),
      );
      const rating = ratingRecord ? ratingRecord.rating : 3;

      for (const item of order.array_item) {
        const dish = item['dish_id'] as {
          _id: string;
          name: string;
          restaurant_id: string;
        };
        if (dish && dish._id && dish.name) {
          if (!dishes.find((d) => d._id === dish._id.toString())) {
            dishes.push({
              _id: dish._id.toString(),
              name: dish.name,
              restaurant_id: dish.restaurant_id.toString(),
              rating: rating,
            });
          }
        }
      }
    }

    return dishes;
  }

  async fetchTotalRevenueByRestaurant(restaurantId: string): Promise<{
    totalRevenue: number;
    totalOrders: number;
    percentageRevenue: number;
  }> {
    const now = new Date();

    const startCurrentMonth = startOfMonth(now);
    const endCurrentMonth = endOfMonth(now);

    const startLastMonth = startOfMonth(subMonths(now, 1));
    const endLastMonth = endOfMonth(subMonths(now, 1));

    const currentMonthOrders = await this.orderModel
      .find({
        restaurant_id: restaurantId,
        status: 'Completed',
        createdAt: { $gte: startCurrentMonth, $lte: endCurrentMonth },
      })
      .exec();

    const lastMonthOrders = await this.orderModel
      .find({
        restaurant_id: restaurantId,
        status: 'Completed',
        createdAt: { $gte: startLastMonth, $lte: endLastMonth },
      })
      .exec();

    const currentRevenue = currentMonthOrders.reduce(
      (sum, order) => sum + order.total_price,
      0,
    );
    const lastMonthRevenue = lastMonthOrders.reduce(
      (sum, order) => sum + order.total_price,
      0,
    );
    const percentageRevenue =
      (currentRevenue - lastMonthRevenue) / lastMonthRevenue;
    return {
      totalRevenue: currentRevenue,
      totalOrders: currentMonthOrders.length,
      percentageRevenue,
    };
  }

  async fetchOrderRate(restaurantId: string): Promise<{
    totalSuccessful: number;
    totalFailed: number;
    successRate: number;
  }> {
    const successOrders = await this.orderModel
      .find({
        restaurant_id: restaurantId,
        status: 'Completed',
      })
      .exec();

    const failOrders = await this.orderModel
      .find({
        restaurant_id: restaurantId,
        status: 'Cancel',
      })
      .exec();

    const rate =
      (successOrders.length * 100) / (successOrders.length + failOrders.length);

    return {
      totalSuccessful: successOrders.length,
      totalFailed: failOrders.length,
      successRate: rate,
    };
  }

  async fetchLoyalCustomer(restaurantId: string): Promise<
    {
      customerName: string;
      totalOrders: number;
      totalSpent: number;
    }[]
  > {
    const now = new Date();
    const startCurrentMonth = startOfMonth(now);
    const endCurrentMonth = endOfMonth(now);

    const currentMonthOrders = await this.orderModel
      .find({
        restaurant_id: restaurantId,
        status: 'Completed',
        createdAt: { $gte: startCurrentMonth, $lte: endCurrentMonth },
      })
      .populate('customer_id', 'name')
      .exec();

    const customerStatsMap = new Map<
      ObjectId,
      { customerName: string; totalOrders: number; totalSpent: number }
    >();

    for (const order of currentMonthOrders) {
      const customerId = order.customer_id;
      const customer = await this.customerModel.findById(customerId);
      const customerName = customer?.name || 'Unknown Customer';

      if (!customerStatsMap.has(customerId)) {
        customerStatsMap.set(customerId, {
          customerName,
          totalOrders: 1,
          totalSpent: order.total_price,
        });
      } else {
        const stats = customerStatsMap.get(customerId)!;
        stats.totalOrders += 1;
        stats.totalSpent += order.total_price;
      }
    }

    return Array.from(customerStatsMap.values());
  }

  async fetchWeeklyRevenue(
    restaurantId: string,
  ): Promise<{ date: string; total: number; day: string }[]> {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 6); // Lấy 7 ngày gần nhất

    const orders = await this.orderModel.aggregate([
      {
        $match: {
          restaurant_id: restaurantId,
          status: 'Completed',
          createdAt: { $gte: start, $lte: end },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
          },
          total: { $sum: '$total_price' },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    const revenueMap = new Map(orders.map((o) => [o._id, o.total]));

    const result: { date: string; total: number; day: string }[] = [];

    for (let i = 6; i >= 0; i--) {
      const current = new Date();
      current.setDate(end.getDate() - i);
      const dateStr = current.toISOString().split('T')[0]; // YYYY-MM-DD
      const dayShort = current.toLocaleDateString('en-US', {
        weekday: 'short',
      });

      result.push({
        date: dateStr,
        total: revenueMap.get(dateStr) || 0,
        day: dayShort,
      });
    }

    return result;
  }
}
