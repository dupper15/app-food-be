import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Dish } from './dish.schema';
import { Model } from 'mongoose';
import { CreateDishDto } from './dto/createDish.dto';
import { Restaurant } from '../restaurant/restaurant.schema';

@Injectable()
export class DishService {
  constructor(
    @InjectModel(Dish.name) private readonly dishModel: Model<Dish>,
    @InjectModel(Restaurant.name)
    private readonly restaurantModel: Model<Restaurant>,
  ) {}

  async createDish(createDishDto: CreateDishDto): Promise<Dish> {
    //check restaurant
    const checkRestaurant = await this.restaurantModel.findById(
      createDishDto.restaurant_id,
    );
    if (!checkRestaurant) {
      throw new BadRequestException('Restaurant not found');
    }
    const newDish = new this.dishModel(createDishDto);
    return newDish.save();
  }
}
