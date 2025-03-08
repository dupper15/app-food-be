import { Controller, Get, Param, Post } from '@nestjs/common';
import { CartService } from './cart.service';

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}
  @Get()
  async getOrdersByUserId(@Param('userId') userId: string) {
    return this.cartService.getOrdersByUserId(userId);
  }
  @Post()
  async addDish(
    @Param('dishId') dishId: string,
    @Param('userId') userId: string,
  ) {
    return this.cartService.addDish(dishId, userId);
  }
}
