import { Controller, Post, Get, Delete, Param, Body } from '@nestjs/common';import { RatingService } from './rating.service';
import { Rating } from './rating.schema';

@Controller('rating')
export class RatingController {
  constructor(private readonly ratingService: RatingService) {}

  @Post('create')
  async createRating(@Body() data: Partial<Rating>): Promise<Rating> {
    return this.ratingService.createRating(data);
  }

  @Get('restaurant/:id')
  async fetchAllRatingsByRestaurant(
    @Param('id') restaurantId: string,
  ): Promise<Rating[]> {
    return this.ratingService.fetchAllRatingsByRestaurant(restaurantId);
  }

  @Get('detail/:id')
  async fetchDetailRating(@Param('id') id: string): Promise<Rating> {
    return this.ratingService.fetchDetailRating(id);
  }

  @Delete('delete/:id')
  async deleteRating(@Param('id') id: string): Promise<{ msg: string }> {
    return this.ratingService.deleteRating(id);
  }
}
