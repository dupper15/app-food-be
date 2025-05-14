import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Order, OrderSchema } from './order.schema';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { VoucherModule } from '../voucher/voucher.module';
import { CustomerModule } from '../customer/customer.module';
import { OrderItemModule } from '../order-item/orderItem.module';
import { CartModule } from '../cart/cart.module';
import { HistoryModule } from '../history/history.module';
import { RatingModule } from '../rating/rating.module';
import { RestaurantModule } from '../restaurant/restaurant.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Order.name,
        schema: OrderSchema,
      },
    ]),
    VoucherModule,
    CustomerModule,
    OrderItemModule,
    CartModule,
    HistoryModule,
    RatingModule,
    forwardRef(() => RestaurantModule),
  ],
  controllers: [OrderController],
  providers: [OrderService],
  exports: [MongooseModule, OrderService],
})
export class OrderModule {}
