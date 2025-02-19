import { InjectModel } from '@nestjs/mongoose';import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { Restaurant } from 'src/modules/restaurant/restaurant.schema';
import { CreateRestaurantDto } from './dto/create-restaurant.dto';

@Injectable()
export class RestaurantService {
  constructor(
    @InjectModel(Restaurant.name)
    private readonly restaurantModel: Model<Restaurant>,
  ) {}
  async create(createRestaurantDto: CreateRestaurantDto): Promise<Restaurant> {
    const newRestaurant = new this.restaurantModel(createRestaurantDto);
    return newRestaurant.save();
  }
}
