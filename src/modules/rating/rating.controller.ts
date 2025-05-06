import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Body,
  Patch,
} from '@nestjs/common';
import { RatingService } from './rating.service';
import { Rating } from './rating.schema';
import { CreateRatingDto } from './dto/createRating';

@Controller('rating')
export class RatingController {
  constructor(private readonly ratingService: RatingService) {}

  @Post('create')
  async createRating(@Body() data: CreateRatingDto): Promise<Rating> {
    return this.ratingService.createRating(data);
  }

  @Get('order/:id')
  async fetchRatingByOrderId(@Param('id') order_id: string): Promise<Rating> {
    return this.ratingService.fetchRatingByOrderId(order_id);
  }

  @Patch('update/:id')
  async updateRating(
    @Param('id') id: string,
    @Body() data: Partial<CreateRatingDto>,
  ): Promise<Rating> {
    return this.ratingService.updateRating(id, data);
  }

  @Get('restaurant/:id')
  async fetchAllRatingsByRestaurant(
    @Param('id') restaurant_id: string,
  ): Promise<Rating[]> {
    return this.ratingService.fetchAllRatingsByRestaurant(restaurant_id);
  }

  @Get('detail/:id')
  async fetchDetailRating(@Param('id') id: string): Promise<Rating> {
    return this.ratingService.fetchDetailRating(id);
  }

  @Delete('delete/:id')
  async deleteRating(@Param('id') id: string): Promise<{ msg: string }> {
    return this.ratingService.deleteRating(id);
  }

  @Get('average/:id')
  async fetchAverageController(
    @Param('id') restaurantId: string,
  ): Promise<number> {
    return await this.ratingService.fetchAverage(restaurantId);
  }
}
