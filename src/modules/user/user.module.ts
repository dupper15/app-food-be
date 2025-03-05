import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './user.schema';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { JwtModule } from 'src/jwt/jwt.module';
import { MailModule } from 'src/mailer/mail.module';

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
  ],
  providers: [UserService],
  controllers: [UserController],
})
export class UserModule {}
