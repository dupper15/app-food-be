import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Notification, NotificationSchema } from './notification.schema';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { CustomerModule } from '../customer/customer.module';
import { RestaurantOwnerModule } from '../restaurant-owner/restaurant-owner.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Notification.name, schema: NotificationSchema },
    ]),
    CustomerModule,
    forwardRef(() => RestaurantOwnerModule),
  ],
  controllers: [NotificationController],
  providers: [NotificationService],
  exports: [MongooseModule, NotificationService],
})
export class NotificationModule {}
