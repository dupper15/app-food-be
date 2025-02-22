import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RestaurantOwnerService } from './restaurant-owner.service';
import { RestaurantOwnerController } from './restaurant-owner.controller';
import {
  RestaurantOwner,
  RestaurantOwnerSchema,
} from './restaurant-owner.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: RestaurantOwner.name,
        schema: RestaurantOwnerSchema,
      },
    ]),
  ],
  providers: [RestaurantOwnerService],
  controllers: [RestaurantOwnerController],
})
export class RestaurantOwnerModule {}
