import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { CartService } from './cart.service';
import { CreateOrderItemDto } from '../order-item/dto/createOrderItem.dto';

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}
  @Get(':userId')
  async getOrdersByUserId(@Param('userId') userId: string) {
    return this.cartService.getOrdersByUserId(userId);
  }
  @Post(':userId')
  async addDish(
    @Body() createOrderItemDto: CreateOrderItemDto,
    @Param('userId') userId: string,
  ) {
    return this.cartService.addDish(createOrderItemDto, userId);
  }
  @Delete(':userId/:orderItemId')
  async removeDish(
    @Param('userId') userId: string,
    @Param('orderItemId') dishId: string,
  ) {
    return this.cartService.deleteOrderItem(userId, dishId);
  }
}
