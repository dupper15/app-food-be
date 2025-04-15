import { Module } from '@nestjs/common';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';
import { RestaurantModule } from '../restaurant/restaurant.module';
import { DishModule } from '../dish/dish.module';

@Module({
  imports: [RestaurantModule, DishModule],
  providers: [SearchService],
  controllers: [SearchController],
  exports: [SearchModule],
})
export class SearchModule {}
