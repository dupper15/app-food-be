import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RestaurantModule } from './modules/restaurant/restaurant.module';
@Module({
  imports: [
    MongooseModule.forRoot('mongodb://127.0.0.1/app-food'),
    RestaurantModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
