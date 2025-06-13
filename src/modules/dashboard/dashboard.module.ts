import { Module } from '@nestjs/common';
import { CustomerModule } from '../customer/customer.module';
import { RestaurantModule } from '../restaurant/restaurant.module';
import { RestaurantOwnerModule } from '../restaurant-owner/restaurant-owner.module';
import { OrderModule } from '../order/order.module';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { RatingModule } from '../rating/rating.module';
import { OrderItemModule } from '../order-item/orderItem.module';
import { DishModule } from '../dish/dish.module';

@Module({
  imports: [
    CustomerModule,
    RestaurantModule,
    RestaurantOwnerModule,
    OrderModule,
    OrderItemModule,
    RatingModule,
    DishModule,
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
