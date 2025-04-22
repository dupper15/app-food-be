import { Module } from '@nestjs/common';
import { CartModule } from '../cart/cart.module';
import { OrderModule } from '../order/order.module';
import { DishModule } from '../dish/dish.module';
import { ToppingModule } from '../topping/topping.module';
import { OrderItemModule } from '../order-item/orderItem.module';
import { ChatBotService } from './chatbot.service';
@Module({
  imports: [
    CartModule,
    OrderModule,
    DishModule,
    ToppingModule,
    OrderItemModule,
  ],
  providers: [ChatBotService],
  exports: [ChatBotService],
})
export class ChatBotModule {}
