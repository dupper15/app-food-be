import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Restaurant,
  RestaurantSchema,
} from 'src/modules/restaurant/restaurant.schema';
import { RestaurantService } from './restaurant.service';
import { RestaurantController } from './restaurant.controller';
import { UploadModule } from '../upload/upload.module';
import { RestaurantOwnerModule } from '../restaurant-owner/restaurant-owner.module';
import { OrderModule } from '../order/order.module';
import { DishModule } from '../dish/dish.module';
import { VoucherModule } from '../voucher/voucher.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Restaurant.name,
        schema: RestaurantSchema,
      },
    ]),
    RestaurantOwnerModule,
    UploadModule,
    DishModule,
    VoucherModule,
    forwardRef(() => OrderModule),
  ],
  providers: [RestaurantService],
  controllers: [RestaurantController],
  exports: [MongooseModule],
})
export class RestaurantModule {}
