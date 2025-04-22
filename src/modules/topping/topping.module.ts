import { Module } from '@nestjs/common';
import { ToppingService } from './topping.service';
import { ToppingController } from './topping.controller';
import { Topping, ToppingSchema } from './topping.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { RestaurantModule } from '../restaurant/restaurant.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Topping.name,
        schema: ToppingSchema,
      },
    ]),
    RestaurantModule,
  ],
  exports: [MongooseModule, ToppingService],
  providers: [ToppingService],
  controllers: [ToppingController],
})
export class ToppingModule {}
