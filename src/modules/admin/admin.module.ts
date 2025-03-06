import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Admin, AdminSchema } from './admin.schema';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { CustomerModule } from '../customer/customer.module';
import { RestaurantOwnerModule } from '../restaurant-owner/restaurant-owner.module';
import { MailModule } from 'src/mailer/mail.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Admin.name,
        schema: AdminSchema,
      },
    ]),
    JwtModule,
    MailModule,
    forwardRef(() => CustomerModule),
    forwardRef(() => RestaurantOwnerModule),
  ],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [MongooseModule],
})
export class AdminModule {}
