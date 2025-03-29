import { Module } from '@nestjs/common';import { MongooseModule } from '@nestjs/mongoose';
import { RestaurantModule } from './modules/restaurant/restaurant.module';
import { RestaurantOwnerModule } from './modules/restaurant-owner/restaurant-owner.module';
import * as dotenv from 'dotenv';
import { UserModule } from './modules/user/user.module';
import { CustomerModule } from './modules/customer/customer.module';
import { ToppingModule } from './modules/topping/topping.module';
import { OrderItemModule } from './modules/order-item/orderItem.module';
import { MessageModule } from './modules/message/message.module';
import { ConversationModule } from './modules/conversation/converstation.module';
import { CategoryModule } from './modules/category/category.module';
import { DishModule } from './modules/dish/dish.module';
import { ReflectModule } from './modules/reflect/reflect.module';
import { NotificationModule } from './modules/notification/notification.module';
import { RatingModule } from './modules/rating/rating.module';
import { ReplyModule } from './modules/reply/reply.module';
import { VoucherModule } from './modules/voucher/voucher.module';
import { HistoryModule } from './modules/history/history.module';
import { UploadModule } from './modules/upload/upload.module';
import { CartModule } from './modules/cart/cart.module';
import { AppController } from './modules/app.controller';
import { OrderModule } from './modules/order/order.module';
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
    ToppingModule,
    OrderModule,
    OrderItemModule,
    MessageModule,
    ConversationModule,
    CategoryModule,
    DishModule,
    ReflectModule,
    NotificationModule,
    RatingModule,
    ReplyModule,
    VoucherModule,
    HistoryModule,
    UploadModule,
    CartModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
