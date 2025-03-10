import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { CartService } from './cart.service';
import { CreateOrderItemDto } from '../order-item/dto/createOrderItem.dto';

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}
  @Get()
  async getOrdersByUserId(@Param('userId') userId: string) {
    return this.cartService.getOrdersByUserId(userId);
  }
  @Post()
  async addDish(
    @Body() createOrderItemDto: CreateOrderItemDto,
    @Param('userId') userId: string,
  ) {
    return this.cartService.addDish(createOrderItemDto, userId);
  }
}
