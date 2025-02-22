import { Module } from '@nestjs/common';import { MongooseModule } from '@nestjs/mongoose';
import { Customer, CustomerSchema } from './customer.schema';
import { CustomerService } from './customer.service';
import { CustomersController } from './customer.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Customer.name,
        schema: CustomerSchema,
      },
    ]),
  ],
  providers: [CustomerService],
  controllers: [CustomersController],
})
export class CustomerModule {}
