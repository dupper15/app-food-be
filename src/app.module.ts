import { Module } from '@nestjs/common';import { MongooseModule } from '@nestjs/mongoose';
import { RestaurantModule } from './modules/restaurant/restaurant.module';
import * as dotenv from 'dotenv';
dotenv.config();
@Module({
  imports: [
    MongooseModule.forRoot(
      process.env.MONGO_URI || 'mongodb://127.0.0.1/app-food',
    ),
    RestaurantModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
