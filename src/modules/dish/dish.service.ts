import { BadRequestException, Injectable } from '@nestjs/common';import { InjectModel } from '@nestjs/mongoose';
import { Dish } from './dish.schema';
import { Model, ObjectId, Types } from 'mongoose';
import { CreateDishDto } from './dto/createDish.dto';
import { Restaurant } from '../restaurant/restaurant.schema';
import { EditToppingDto } from '../topping/dto/editTopping.dto';

@Injectable()
export class DishService {
  constructor(
    @InjectModel(Dish.name) private readonly dishModel: Model<Dish>,
    @InjectModel(Restaurant.name)
    private readonly restaurantModel: Model<Restaurant>,
  ) {}
  async getRestaurantByDish(id: ObjectId): Promise<Restaurant> {
    const dish = await this.dishModel.findById(id);
    if (!dish) {
      throw new BadRequestException('Dish not found');
    }
    const restaurant = await this.restaurantModel.findById(dish.restaurant_id);
    if (!restaurant) {
      throw new BadRequestException('Restaurant not found');
    }
    return restaurant;
  }
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

  async editDish(id: ObjectId, editDishDto: EditToppingDto): Promise<Dish> {
    const updatedDish = await this.dishModel.findByIdAndUpdate(
      id,
      editDishDto,
      { new: true, runValidators: true },
    );

    //check updated dish
    if (!updatedDish) {
      throw new BadRequestException('Dish not found');
    }

    return updatedDish;
  }

  async deleteDish(id: ObjectId): Promise<{ msg: string }> {
    //find dish to delete
    const deletedDish = await this.dishModel.findById(id);

    //check dish
    if (!deletedDish) {
      throw new BadRequestException('Dish not found');
    }

    //delete
    await this.dishModel.findByIdAndDelete(id);

    return { msg: 'Dish deleted successfully' };
  }

  async fetchAllDishByRestaurant(id: ObjectId): Promise<Dish[]> {
    return await this.dishModel
      .find({
        restaurant_id: id,
      })
      .exec();
  }

  async fetchDetailDish(id: ObjectId): Promise<Dish> {
    //check dish
    const checkDish = await this.dishModel.findById(id);
    if (!checkDish) {
      throw new BadRequestException('Dish not found');
    }
    return checkDish;
  }

  async fetchAllDishCategoryByRestaurant(
    restaurant_id: ObjectId,
    category_id: ObjectId,
  ): Promise<Dish[]> {
    console.log('sdfdsf');
    const dishByRestaurant = await this.dishModel.find({
      restaurant_id: restaurant_id,
      category_id: category_id,
    });
    if (!dishByRestaurant || dishByRestaurant.length === 0) {
      throw new BadRequestException(
        'No dishes found for this category in the specified restaurant',
      );
    }

    return dishByRestaurant;
  }
}
