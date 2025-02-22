import {  Controller,
  Post,
  Body,
  UsePipes,
  ValidationPipe,
  Get,
  NotFoundException,
  Param,
} from '@nestjs/common';
import { RestaurantService } from './restaurant.service';
import { CreateRestaurantDto } from './dto/create-restaurant.dto';
import { ObjectId } from 'mongoose';

@Controller('restaurants')
export class RestaurantController {
  constructor(private readonly restaurantService: RestaurantService) {}

  @Post()
  @UsePipes(new ValidationPipe())
  async createRestaurant(@Body() createRestaurantDto: CreateRestaurantDto) {
    return await this.restaurantService.create(createRestaurantDto);
  }

  @Get()
  async fetchAllRestaurant() {
    return await this.restaurantService.fetchAll();
  }

  @Get(':id')
  async fetchRestaurantById(@Param('id') id: ObjectId) {
    return await this.restaurantService.fetchDetailRestaurant(id);
  }
}
