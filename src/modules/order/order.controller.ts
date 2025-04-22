import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Put,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/createOrder.dto';
import { ObjectId } from 'mongoose';

@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post('create')
  @UsePipes(new ValidationPipe())
  async createOrderController(@Body() createOrderDto: CreateOrderDto) {
    console.log(createOrderDto);
    return await this.orderService.createOrder(createOrderDto);
  }

  @Post('re-order/:id')
  async reOrderController(@Param('id') orderId: ObjectId) {
    return await this.orderService.reOrder(orderId);
  }

  @Put('cancel-order/:id')
  async cancelOrderController(@Param('id') orderId: ObjectId) {
    return await this.orderService.cancelOrder(orderId);
  }

  @Patch('restaurant/cancel-order/:id')
  async cancelOrderByRestaurantController(@Param('id') id: ObjectId) {
    return await this.orderService.cancelOrderByRestaurant(id);
  }

  @Get('fetchall-order-by-customer/:id')
  async fetchAllOrderByCustomerController(@Param('id') customerId: ObjectId) {
    return await this.orderService.fetchAllOrderByCustomer(customerId);
  }

  @Get('fetch-detail-order/:id')
  async fetchDetailOrderController(@Param('id') orderId: ObjectId) {
    return await this.orderService.fetchDetailOrder(orderId);
  }

  @Get('fetch-successfull-order-by-restaurant/:id')
  async fetchSuccessfullOrderByRestaurantController(
    @Param('id') restaurantId: ObjectId,
  ) {
    return await this.orderService.fetchSuccessfullOrderByRestaurant(
      restaurantId,
    );
  }

  @Get('fetch-pending-order-by-restaurant/:id')
  async fetchPendingOrderByRestaurantController(
    @Param('id') restaurantId: ObjectId,
  ) {
    return await this.orderService.fetchPendingOrderByRestaurant(restaurantId);
  }

  @Get('fetch-ongoing-order-by-restaurant/:id')
  async fetchOngoingOrderByRestaurantController(
    @Param('id') restaurantId: ObjectId,
  ) {
    return await this.orderService.fetchOngoingOrderByRestaurant(restaurantId);
  }

  @Get('fetch-cancelled-order-by-restaurant/:id')
  async fetchCancelledOrderByRestaurantController(
    @Param('id') restaurantId: ObjectId,
  ) {
    return await this.orderService.fetchCancelledOrderByRestaurant(
      restaurantId,
    );
  }

  @Patch('update-status/:id')
  async updateStatusOrderController(@Param('id') id: string) {
    return await this.orderService.updateStatusOrder(id);
  }
}
