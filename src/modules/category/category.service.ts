import { BadRequestException, Injectable } from '@nestjs/common';import { InjectModel } from '@nestjs/mongoose';
import { Category } from './category.schema';
import { Model, ObjectId } from 'mongoose';
import { CreateCategoryDto } from './dto/createCategory.dto';
import { Restaurant } from '../restaurant/restaurant.schema';
import { Dish } from '../dish/dish.schema';

@Injectable()
export class CategoryService {
  constructor(
    @InjectModel(Category.name) private readonly categoryModel: Model<Category>,
    @InjectModel(Restaurant.name)
    private readonly restaurantModel: Model<Restaurant>,
    @InjectModel(Dish.name) private readonly dishModel: Model<Dish>,
  ) {}

  async createCategory(
    createCategoryDto: CreateCategoryDto,
  ): Promise<Category> {
    //check name category
    const existingCategory = await this.categoryModel.findOne({
      name: createCategoryDto.name,
    });
    if (existingCategory) {
      throw new BadRequestException('Category already exists');
    }
    const newCategory = new this.categoryModel(createCategoryDto);
    return newCategory.save();
  }

  async fetchAllCategory() {
    const categories = await this.categoryModel
      .find({ isDeleted: false })
      .select('_id name')
      .exec();
    return categories;
  }

  async fetchAllCategoryByRestaurant(id: ObjectId): Promise<Category[]> {
    // check restaurant
    const checkRestaurant = await this.restaurantModel.findById(id);
    if (!checkRestaurant) {
      throw new BadRequestException('Restaurant not found');
    }

    const categoriesByRestaurant = await this.dishModel
      .find({ restaurant_id: id, isDeleted: false })
      .select('category_id')
      .exec();

    // filter id categories in dish
    const array_categories = [
      ...new Set(categoriesByRestaurant.map((dish) => dish.category_id)),
    ];

    // select name of category
    const categories = await this.categoryModel
      .find({ _id: { $in: array_categories } })
      .select('_id name')
      .exec();

    return categories;
  }

  async deleteCategory(id: ObjectId): Promise<{ msg: string }> {
    const deletedCategory = await this.categoryModel.findByIdAndDelete(id);
    if (!deletedCategory) {
      throw new BadRequestException('Category not found');
    }
    return { msg: 'Category deleted successfully' };
  }
}
