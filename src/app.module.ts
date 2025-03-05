import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RestaurantModule } from './modules/restaurant/restaurant.module';
import * as dotenv from 'dotenv';
import { UserModule } from './modules/user/user.module';
import { CustomerModule } from './modules/customer/customer.module';
import { ToppingModule } from './modules/topping/topping.module';
import { OrderItemModule } from './modules/order-item/orderItem.module';
dotenv.config();
@Module({
  imports: [
    MongooseModule.forRoot(
      process.env.MONGO_URI || 'mongodb://127.0.0.1/app-food',
    ),
    RestaurantModule,
    UserModule,
    CustomerModule,
    ToppingModule,
    OrderItemModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
