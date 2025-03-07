import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Dish, DishSchema } from './dish.schema';
import { DishController } from './dish.controller';
import { DishService } from './dish.service';
import { RestaurantModule } from '../restaurant/restaurant.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Dish.name,
        schema: DishSchema,
      },
    ]),
    RestaurantModule,
  ],
  controllers: [DishController],
  providers: [DishService],
  exports: [MongooseModule],
})
export class DishModule {}
