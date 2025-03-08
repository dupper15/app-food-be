import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CartSchema } from './cart.schema';
import { DishModule } from '../dish/dish.module';
import { OrderItemModule } from '../order-item/orderItem.module';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: 'Cart',
        schema: CartSchema,
      },
    ]),
    OrderItemModule,
    DishModule,
  ],
  controllers: [CartController],
  providers: [CartService],
})
export class CartModule {}
