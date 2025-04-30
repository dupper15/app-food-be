import { Module } from '@nestjs/common';
import { SmsService } from './sms.service';
import { SmsController } from './sms.controller';
import { CustomerModule } from '../customer/customer.module';
import { RestaurantOwnerModule } from '../restaurant-owner/restaurant-owner.module';

@Module({
  providers: [SmsService],
  controllers: [SmsController],
  imports: [CustomerModule, RestaurantOwnerModule],
})
export class SmsModule {}
