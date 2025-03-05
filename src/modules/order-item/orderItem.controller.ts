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

@Controller('order-items')
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
}
