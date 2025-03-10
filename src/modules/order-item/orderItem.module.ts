import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OrderItem, OrderItemSchema } from './orderItem.schema';
import { OrderItemController } from './orderItem.controller';
import { OrderItemService } from './orderItem.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: OrderItem.name,
        schema: OrderItemSchema,
      },
    ]),
  ],
  controllers: [OrderItemController],
  providers: [OrderItemService],
  exports: [OrderItemModule, OrderItemService],
})
export class OrderItemModule {}
