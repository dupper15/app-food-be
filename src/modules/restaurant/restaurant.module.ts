import { Module } from '@nestjs/common';import { MongooseModule } from '@nestjs/mongoose';
import {
  Restaurant,
  RestaurantSchema,
} from 'src/modules/restaurant/restaurant.schema';
import { RestaurantService } from './restaurant.service';
import { RestaurantController } from './restaurant.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Restaurant.name,
        schema: RestaurantSchema,
      },
    ]),
  ],
  providers: [RestaurantService],
  controllers: [RestaurantController],
})
export class RestaurantModule {}
