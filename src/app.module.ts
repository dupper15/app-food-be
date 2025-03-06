import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RestaurantModule } from './modules/restaurant/restaurant.module';
import { RestaurantOwnerModule } from './modules/restaurant-owner/restaurant-owner.module';
import * as dotenv from 'dotenv';
import { UserModule } from './modules/user/user.module';
import { CustomerModule } from './modules/customer/customer.module';
dotenv.config();
@Module({
  imports: [
    MongooseModule.forRoot(
      process.env.MONGO_URI || 'mongodb://127.0.0.1/app-food',
    ),
    RestaurantModule,
    UserModule,
    CustomerModule,
    RestaurantOwnerModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
