import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Dish } from './dish.schema';
import { Model, ObjectId } from 'mongoose';
import { CreateDishDto } from './dto/createDish.dto';
import { Restaurant } from '../restaurant/restaurant.schema';
import { EditDishDto } from './dto/editDish.dto';

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
    return await this.dishModel.create(createDishDto);
  }

  async editDish(id: string, editDishDto: EditDishDto): Promise<Dish> {
    const updatedDish = await this.dishModel.findByIdAndUpdate(
      id,
      editDishDto,
      { new: true },
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

  async fetchAllDishByRestaurant(id: string): Promise<Dish[]> {
    const dishes = await this.dishModel
      .find({
        restaurant_id: id,
      })
      .populate('topping', 'name price')
      .lean()
      .exec();
    if (!dishes || dishes.length === 0) {
      console.log('No dishes found for restaurant:', id);
    }
    return dishes;
  }

  async fetchDetailDish(id: ObjectId): Promise<Dish> {
    //check dish
    const checkDish = await this.dishModel
      .findById(id)
      .populate('topping', 'name price')
      .populate('restaurant_id', 'name');
    if (!checkDish) {
      throw new BadRequestException('Dish not found');
    }
    return checkDish;
  }

  async fetchAllDishCategoryByRestaurant(
    restaurant_id: ObjectId,
    category_id: ObjectId,
  ): Promise<Dish[]> {
    const dishByRestaurant = await this.dishModel
      .find({
        restaurant_id: restaurant_id,
        category_id: category_id,
      })
      .populate('topping', 'name price')
      .populate('restaurant_id', 'name')
      .exec();
    if (!dishByRestaurant || dishByRestaurant.length === 0) {
      throw new BadRequestException(
        'No dishes found for this category in the specified restaurant',
      );
    }

    return dishByRestaurant;
  }
  async fetchBotDish(): Promise<Dish[]> {
    const dishByRestaurant = await this.dishModel
      .find({})
      .select('name _id')
      .exec();
    if (!dishByRestaurant || dishByRestaurant.length === 0) {
      throw new BadRequestException(
        'No dishes found for this category in the specified restaurant',
      );
    }
    return dishByRestaurant;
  }
  async fetchDishById(dishes: string[]): Promise<Dish[]> {
    const ans: Dish[] = [];

    await Promise.all(
      dishes.map(async (dishId) => {
        const temp = await this.dishModel.findById(dishId);
        if (temp) ans.push(temp);
      }),
    );

    return ans;
  }

  async fetchAllDishNameAndId() {
    const dishByRestaurant = await this.dishModel.find({}).exec();
    if (!dishByRestaurant || dishByRestaurant.length === 0) {
      throw new BadRequestException(
        'No dishes found for this category in the specified restaurant',
      );
    }

    return dishByRestaurant.map((dish) => ({
      _id: dish._id.toString(),
      name: dish.name,
      restaurant_id: dish.restaurant_id.toString(),
    }));
  }
}
