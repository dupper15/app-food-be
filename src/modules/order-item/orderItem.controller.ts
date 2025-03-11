import {
  Body,
  Controller,
  Delete,
  Param,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { OrderItemService } from './orderItem.service';
import { CreateOrderItemDto } from './dto/createOrderItem.dto';
import { ObjectId } from 'mongoose';
import { Types } from 'mongoose';

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

  @Post('increase-quantity/:id')
  async increaseQuantityController(@Param('id') id: ObjectId) {
    return await this.orderItemService.increaseQuantity(id);
  }

  @Post('decrease-quantity/:id')
  async decreaseQuantityController(@Param('id') id: ObjectId): Promise<any> {
    return await this.orderItemService.decreaseQuantity(id);
  }

  @Post('fetchall-order-item-by-list-id')
  async fetchAllOrderItemByListIdController(@Body() listId: ObjectId[]) {
    return await this.orderItemService.fetchAllOrderItemByListId(listId);
  }
  @Post('add-topping/:id')
  async addToppingController(
    @Param('id') id: ObjectId,
    @Body('list_topping') list_topping: Types.ObjectId[],
  ) {
    return await this.orderItemService.addTopping(id, list_topping);
  }
}
