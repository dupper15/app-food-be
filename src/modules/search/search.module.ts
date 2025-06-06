import { Module } from '@nestjs/common';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';
import { RestaurantModule } from '../restaurant/restaurant.module';
import { DishModule } from '../dish/dish.module';
import { ChatBotModule } from '../chatbot/chatbot.module';
import { UploadModule } from '../upload/upload.module';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    RestaurantModule,
    DishModule,
    ChatBotModule,
    UploadModule,
    HttpModule,
  ],
  providers: [SearchService],
  controllers: [SearchController],
  exports: [SearchModule],
})
export class SearchModule {}
