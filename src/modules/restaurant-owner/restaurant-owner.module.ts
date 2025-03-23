import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RestaurantOwnerService } from './restaurant-owner.service';
import { RestaurantOwnerController } from './restaurant-owner.controller';
import {
  RestaurantOwner,
  RestaurantOwnerSchema,
} from './restaurant-owner.schema';
import { JwtModule } from 'src/jwt/jwt.module';
import { MailModule } from 'src/mailer/mail.module';
import { CustomerModule } from '../customer/customer.module';
import { AdminModule } from '../admin/admin.module';
import { UploadModule } from '../upload/upload.module';
@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: RestaurantOwner.name,
        schema: RestaurantOwnerSchema,
      },
    ]),
    JwtModule,
    MailModule,
    UploadModule,
    forwardRef(() => CustomerModule),
    forwardRef(() => AdminModule),
  ],
  providers: [RestaurantOwnerService],
  controllers: [RestaurantOwnerController],
  exports: [MongooseModule],
})
export class RestaurantOwnerModule {}
