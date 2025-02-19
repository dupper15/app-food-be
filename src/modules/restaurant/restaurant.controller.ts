import {
  Controller,
  Post,
  Body,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { RestaurantService } from './restaurant.service';
import { CreateRestaurantDto } from './dto/create-restaurant.dto';

@Controller('restaurants')
export class RestaurantController {
  constructor(private readonly restaurantService: RestaurantService) {}

  @Post()
  @UsePipes(new ValidationPipe())
  async createRestaurant(@Body() createRestaurantDto: CreateRestaurantDto) {
    console.log(createRestaurantDto);
    return await this.restaurantService.create(createRestaurantDto);
  }
}
