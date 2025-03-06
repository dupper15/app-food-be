import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './user.schema';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { JwtModule } from 'src/jwt/jwt.module';
import { MailModule } from 'src/mailer/mail.module';
import { CustomerModule } from '../customer/customer.module';
import { AdminModule } from '../admin/admin.module';
import { RestaurantOwnerModule } from '../restaurant-owner/restaurant-owner.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: User.name,
        schema: UserSchema,
      },
    ]),
    JwtModule,
    MailModule,
    CustomerModule,
    AdminModule,
    RestaurantOwnerModule,
  ],
  providers: [UserService],
  controllers: [UserController],
})
export class UserModule {}
