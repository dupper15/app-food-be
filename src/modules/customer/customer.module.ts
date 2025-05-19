import { forwardRef, Module } from '@nestjs/common';import { MongooseModule } from '@nestjs/mongoose';
import { Customer, CustomerSchema } from './customer.schema';
import { CustomerService } from './customer.service';
import { CustomersController } from './customer.controller';
import { JwtModule } from 'src/jwt/jwt.module';
import { MailModule } from 'src/mailer/mail.module';
import { AdminModule } from '../admin/admin.module';
import { RestaurantOwnerModule } from '../restaurant-owner/restaurant-owner.module';
import { GeocodingModule } from '../geocoding/geocoding.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Customer.name,
        schema: CustomerSchema,
      },
    ]),
    JwtModule,
    MailModule,
    GeocodingModule,
    forwardRef(() => RestaurantOwnerModule),
    forwardRef(() => AdminModule),
  ],
  providers: [CustomerService],
  controllers: [CustomersController],
  exports: [MongooseModule],
})
export class CustomerModule {}
