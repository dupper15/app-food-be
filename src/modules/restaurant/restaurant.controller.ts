import {
  Controller,
  Post,
  Body,
  UsePipes,
  ValidationPipe,
  Get,
  Param,
} from '@nestjs/common';
import { RestaurantService } from './restaurant.service';
import { CreateRestaurantDto } from './dto/create-restaurant.dto';

@Controller('restaurants')
export class RestaurantController {
  constructor(private readonly restaurantService: RestaurantService) {}

  @Post()
  @UsePipes(new ValidationPipe())
  async createRestaurant(
    @Body() createRestaurantDto: CreateRestaurantDto,
  ): Promise<any> {
    return await this.restaurantService.create(createRestaurantDto);
  }

  @Get()
  async fetchAllRestaurant() {
    return await this.restaurantService.fetchAll();
  }

  @Get(':id')
  async fetchRestaurantById(@Param('id') id: string) {
    return await this.restaurantService.fetchDetailRestaurant(id);
  }
}
