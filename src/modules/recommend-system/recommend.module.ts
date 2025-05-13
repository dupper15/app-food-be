import { Module } from '@nestjs/common';
import { RecommendService } from './recommend.service';
import { RecommendController } from './recommend.controller';
import { OrderModule } from '../order/order.module';
import { RestaurantModule } from '../restaurant/restaurant.module';
import { DishModule } from '../dish/dish.module';
import { OrderItemModule } from '../order-item/orderItem.module';

@Module({
  imports: [OrderModule, RestaurantModule, DishModule, OrderItemModule],
  providers: [RecommendService],
  controllers: [RecommendController],
  exports: [RecommendService],
})
export class RecommendModule {}
