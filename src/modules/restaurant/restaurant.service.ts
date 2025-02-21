import { InjectModel } from '@nestjs/mongoose';import { Injectable, NotFoundException } from '@nestjs/common';
import { Model, ObjectId } from 'mongoose';
import { Restaurant } from 'src/modules/restaurant/restaurant.schema';
import { CreateRestaurantDto } from './dto/create-restaurant.dto';
import { NotFoundError } from 'rxjs';

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

  async fetchAll(): Promise<Restaurant[]> {
    return this.restaurantModel.find().exec();
  }

  async fetchDetailRestaurant(id: ObjectId): Promise<Restaurant> {
    const restaurant = await this.restaurantModel.findById(id).exec();
    if (!restaurant) {
      throw new NotFoundException(`Restaurant with ID ${id} not found`);
    }
    return restaurant;
  }
}
