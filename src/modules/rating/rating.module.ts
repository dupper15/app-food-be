import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Rating, RatingSchema } from './rating.schema';
import { RatingService } from './rating.service';
import { RatingController } from './rating.controller';
import { Order, OrderSchema } from '../order/order.schema';
import { Restaurant, RestaurantSchema } from '../restaurant/restaurant.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Rating.name, schema: RatingSchema },
      { name: Order.name, schema: OrderSchema },
      { name: Restaurant.name, schema: RestaurantSchema }, // Import Order model - provide actual schema
    ]),
  ],
  controllers: [RatingController],
  providers: [RatingService],
  exports: [RatingService, MongooseModule],
})
export class RatingModule {}
