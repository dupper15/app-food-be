import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Customer, CustomerSchema } from './customer.schema';
import { CustomerService } from './customer.service';
import { CustomersController } from './customer.controller';
import { JwtModule } from 'src/jwt/jwt.module';
import { MailModule } from 'src/mailer/mail.module';

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
  ],
  providers: [CustomerService],
  controllers: [CustomersController],
})
export class CustomerModule {}
