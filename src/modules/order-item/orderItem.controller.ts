import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { OrderItemService } from './orderItem.service';
import { CreateOrderItemDto } from './dto/createOrderItem.dto';
import { ObjectId } from 'mongoose';

@Controller('order-item')
export class OrderItemController {
  constructor(private readonly orderItemService: OrderItemService) {}

  @Post('create')
  @UsePipes(new ValidationPipe())
  async createOrderItemController(
    @Body() createOrderItemDto: CreateOrderItemDto,
  ) {
    return await this.orderItemService.createOrderItem(createOrderItemDto);
  }

  @Delete('delete/:id')
  async deleteOrderItemController(@Param('id') id: ObjectId) {
    return await this.orderItemService.deleteOrderItem(id);
  }
  @Put(':id')
  async editOrderItemController(
    @Param('id') id: ObjectId,
    @Body() editOrderItem: any,
  ) {
    return await this.orderItemService.editOrderItem(id, editOrderItem);
  }

  @Post('fetchall-order-item-by-list-id')
  async fetchAllOrderItemByListIdController(@Body() listId: ObjectId[]) {
    return await this.orderItemService.fetchAllOrderItemByListId(listId);
  }
  @Get(':userId/:dishId')
  async getOrderItemController(
    @Param('userId') userId: ObjectId,
    @Param('dishId') dishId: ObjectId,
  ) {
    return await this.orderItemService.getOrderItem(userId, dishId);
  }
}
