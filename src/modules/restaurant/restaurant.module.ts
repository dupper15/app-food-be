import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Restaurant,
  RestaurantSchema,
} from 'src/modules/restaurant/restaurant.schema';
import { RestaurantService } from './restaurant.service';
import { RestaurantController } from './restaurant.controller';
import { UploadModule } from '../upload/upload.module';
import { RestaurantOwnerModule } from '../restaurant-owner/restaurant-owner.module';

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
  ],
  providers: [RestaurantService],
  controllers: [RestaurantController],
  exports: [MongooseModule],
})
export class RestaurantModule {}
