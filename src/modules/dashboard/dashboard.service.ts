import { Injectable } from '@nestjs/common';
import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Customer } from '../customer/customer.schema';
import { RestaurantOwner } from '../restaurant-owner/restaurant-owner.schema';
import { Restaurant } from '../restaurant/restaurant.schema';
import { Order } from '../order/order.schema';
import moment from 'moment';
import { RatingService } from '../rating/rating.service';
import { OrderService } from '../order/order.service';
import { OrderItem } from '../order-item/orderItem.schema';
import { Dish } from '../dish/dish.schema';

@Injectable()
export class DashboardService {
  constructor(
    @InjectModel(Customer.name)
    private readonly customerModel: Model<Customer>,
    @InjectModel(RestaurantOwner.name)
    private readonly restaurantOwnerModel: Model<RestaurantOwner>,
    @InjectModel(Restaurant.name)
    private readonly restaurantModel: Model<Restaurant>,
    @InjectModel(Order.name)
    private readonly orderModel: Model<Order>,
    @InjectModel(OrderItem.name)
    private readonly orderItemModel: Model<OrderItem>,
    @InjectModel(Dish.name)
    private readonly dishModel: Model<Dish>,
    private readonly ratingService: RatingService,
    private readonly orderService: OrderService,
  ) {}

  async getAll() {
    const totalRestaurants = await this.restaurantModel.countDocuments();
    const allOrders = await this.orderModel.find();
    const totalOrders = allOrders.length;
    const allCustomers = await this.customerModel.countDocuments();
    const allRestaurantOwners =
      await this.restaurantOwnerModel.countDocuments();
    const totalUsers = allCustomers + allRestaurantOwners;
    const completedOrders = await this.orderModel.find({ status: 'Completed' });
    const totalRevenue = completedOrders.reduce((sum, order) => {
      return sum + (order?.total_price || 0);
    }, 0);

    return {
      totalRestaurants: totalRestaurants,
      totalOrders: totalOrders,
      totalUsers: totalUsers,
      totalRevenue: totalRevenue,
    };
  }
  async getMonthOrder() {
    const startOfYear = moment().startOf('year').toDate();
    const endOfYear = moment().endOf('year').toDate();
    const result = await this.orderModel.aggregate([
      {
        $match: {
          createdAt: {
            $gte: startOfYear,
            $lte: endOfYear,
          },
        },
      },
      {
        $group: {
          _id: { month: { $month: '$createdAt' } },
          orders: { $sum: 1 },
        },
      },
      {
        $sort: { '_id.month': 1 },
      },
    ]);
    const monthlyData = Array.from({ length: 12 }).map((_, idx) => {
      const month = idx + 1;
      const found = result.find((r) => r._id.month === month);
      return {
        month: moment().month(idx).format('MMM'), // 'Jan', 'Feb', ...
        orders: found?.orders || 0,
      };
    });
    return monthlyData;
  }
  async getMonthDish() {
    const startOfYear = moment().startOf('year').toDate();
    const endOfYear = moment().endOf('year').toDate();

    const result = await this.orderModel.aggregate([
      {
        $match: {
          status: 'Completed',
          createdAt: { $gte: startOfYear, $lte: endOfYear },
        },
      },
      {
        $addFields: {
          array_item: {
            $map: {
              input: '$array_item',
              as: 'item',
              in: { $toObjectId: '$$item' },
            },
          },
        },
      },
      {
        $lookup: {
          from: 'orderitems',
          localField: 'array_item',
          foreignField: '_id',
          as: 'items',
        },
      },
      { $unwind: '$items' },
      {
        $group: {
          _id: { month: { $month: '$createdAt' } },
          value: { $sum: '$items.quantity' },
        },
      },
      {
        $sort: {
          '_id.month': 1,
        },
      },
    ]);
    const currentMonth = moment().month() + 1;
    // Chuẩn hóa kết quả cho đủ 12 tháng
    const monthlyData = Array.from({ length: currentMonth }).map((_, idx) => {
      const month = idx + 1;
      const found = result.find((r) => r._id.month === month);

      return {
        month: moment().month(idx).format('MMM'), // 'Jan', 'Feb', ...
        value: found?.value || 0,
      };
    });
    return monthlyData;
  }
  async getTopTenRestaurant(filter: string = 'order', sortBy: string = 'desc') {
    const allRestaurants = await this.restaurantModel.find().exec();

    const restaurantsWithMetrics = await Promise.all(
      allRestaurants.map(async (restaurantDoc) => {
        const restaurant = restaurantDoc.toObject() as Restaurant & {
          _id: Types.ObjectId;
        };
        const owner = await this.restaurantOwnerModel.findById(
          restaurant.owner_id,
        );
        const avatar = owner?.avatar;
        const restaurantId = restaurant._id.toString();
        const averageRating =
          await this.ratingService.fetchAverage(restaurantId);
        const totalRevenue =
          await this.orderService.fetchRevenueByRestaurant(restaurantId);
        return {
          _id: restaurant._id,
          avatar: avatar,
          name: restaurant.name,
          address: restaurant.address,
          totalOrders: restaurant.total_orders || 0,
          totalReviews: restaurant.total_reviews || 0,
          averageRating: averageRating || 0,
          totalRevenue: totalRevenue || 0,
        };
      }),
    );

    const topRevenueRestaurants = restaurantsWithMetrics
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, 10);

    const sorted = topRevenueRestaurants.sort((a, b) => {
      let aValue = 0;
      let bValue = 0;

      switch (filter) {
        case 'rating':
          aValue = a.averageRating;
          bValue = b.averageRating;
          break;
        case 'order':
          aValue = a.totalOrders;
          bValue = b.totalOrders;
          break;
        case 'revenue':
          aValue = a.totalRevenue;
          bValue = b.totalRevenue;
          break;
        case 'review':
          aValue = a.totalReviews;
          bValue = b.totalReviews;
          break;
        default:
          return 0;
      }

      return sortBy === 'desc' ? bValue - aValue : aValue - bValue;
    });

    return sorted.slice(0, 10);
  }
  async getTopTenUser(filter: string = 'login', sortBy: string = 'desc') {
    const allCustomers = await this.customerModel.find().exec();

    const mappedCustomers = allCustomers.map((customer) => ({
      _id: customer._id,
      name: customer.name,
      avatar: customer.avatar,
      email: customer.email,
      phone: customer.phone,
      total_logins: customer.total_logins || 0,
      total_orders: customer.total_orders || 0,
      total_time_spent: customer.total_time_spent || 0,
    }));

    const sorted = mappedCustomers.sort((a, b) => {
      let aValue = 0;
      let bValue = 0;

      switch (filter) {
        case 'login':
          aValue = a.total_logins;
          bValue = b.total_logins;
          break;
        case 'order':
          aValue = a.total_orders;
          bValue = b.total_orders;
          break;
        case 'time':
          aValue = a.total_time_spent;
          bValue = b.total_time_spent;
          break;
        default:
          return 0;
      }

      return sortBy === 'desc' ? bValue - aValue : aValue - bValue;
    });

    return sorted.slice(0, 10);
  }
  async getTopTenDish() {
    const allOrderCompleted = await this.orderModel
      .find({ status: 'Completed' })
      .exec();
    const allOrderItems = allOrderCompleted.flatMap(
      (order) => order.array_item,
    );
    const dishMap = new Map<
      string,
      { dish_id: string; quantity: number; totalPrice: number }
    >();

    for (const item of allOrderItems) {
      const orderItem = await this.orderItemModel.findById(item);
      const dish = await this.dishModel.findById(orderItem?.dish_id);
      if (dish && orderItem) {
        const current = dishMap.get(dish?._id.toString());
        if (current) {
          current.quantity += orderItem.quantity;
          current.totalPrice += dish.price * orderItem.quantity;
        } else {
          dishMap.set(dish?._id.toString(), {
            dish_id: dish?._id.toString(),
            quantity: orderItem.quantity,
            totalPrice: dish.price * orderItem.quantity,
          });
        }
      }
    }
    // Lấy danh sách food_id để truy vấn thông tin món ăn
    const dishIds = Array.from(dishMap.keys());
    const dishes = await this.dishModel.find({ _id: { $in: dishIds } });
    // Tạo map restaurant_id -> name để tránh gọi DB nhiều lần
    const restaurantIds = [
      ...new Set(dishes.map((dish) => dish.restaurant_id)),
    ];
    const restaurants = await this.restaurantModel.find({
      _id: { $in: restaurantIds },
    });
    const restaurantMap = new Map(
      restaurants.map((r) => [(r._id as Types.ObjectId).toString(), r.name]),
    );
    const result = dishes.map((dish) => {
      const data = dishMap.get(dish._id.toString());
      const restaurantName =
        restaurantMap.get(dish?.restaurant_id.toString()) || 'Unknown';

      return {
        _id: dish._id,
        image: dish.image,
        name: dish.name,
        restaurant_name: restaurantName,
        price: dish.price,
        total_order: data?.quantity || 0,
        total_sale: data?.totalPrice || 0,
      };
    });
    return result.slice(0, 10).reverse();
  }
  async getPieChartOrder() {
    const completedOrders = await this.orderModel.countDocuments({
      status: 'Completed',
    });
    const canceledOrders = await this.orderModel.countDocuments({
      status: 'Cancel',
    });
    return {
      completed: completedOrders,
      canceled: canceledOrders,
    };
  }
  async getPieChartProductSale(filter: string = 'today') {
    let startDate: Date;
    let endDate: Date;

    if (filter === 'today') {
      startDate = moment().startOf('day').toDate();
      endDate = moment().endOf('day').toDate();
    } else if (filter === 'month') {
      startDate = moment().startOf('month').toDate();
      endDate = moment().endOf('month').toDate();
    } else {
      throw new Error("Invalid filter. Use 'today' or 'month'");
    }

    // Tìm tất cả order trong khoảng thời gian
    const allOrders = await this.orderModel.find({
      createdAt: { $gte: startDate, $lte: endDate },
    });

    const totalOrders = allOrders.length;
    const cancelledOrders = allOrders.filter(
      (order) => order.status === 'Cancel',
    ).length;
    const otherOrders = totalOrders - cancelledOrders;

    return [
      { name: 'Total Orders', value: totalOrders },
      { name: 'Cancelled Orders', value: cancelledOrders },
      { name: 'Other Orders', value: otherOrders },
    ];
  }
  async getTotalDish() {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const totalDishes = await this.dishModel.countDocuments().exec();
    const totalDishesAddToday = await this.dishModel
      .countDocuments({ createdAt: { $gte: todayStart } })
      .exec();

    const totalOrders = await this.orderModel.countDocuments().exec();
    const totalOrdersToday = await this.orderModel
      .countDocuments({ createdAt: { $gte: todayStart } })
      .exec();
    return {
      totalDishes: totalDishes,
      totalDishesAddToday: totalDishesAddToday,
      totalOrders: totalOrders,
      totalOrdersToday: totalOrdersToday,
    };
  }
}
