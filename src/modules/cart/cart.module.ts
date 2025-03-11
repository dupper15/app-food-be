import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Cart, CartSchema } from './cart.schema';
import { DishModule } from '../dish/dish.module';
import { OrderItemModule } from '../order-item/orderItem.module';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Cart.name,
        schema: CartSchema,
      },
    ]),
    OrderItemModule,
    DishModule,
  ],
  controllers: [CartController],
  providers: [CartService],
  exports: [MongooseModule],
})
export class CartModule {}
