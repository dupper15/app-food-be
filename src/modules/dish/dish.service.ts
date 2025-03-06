import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Dish } from './dish.schema';
import { Model } from 'mongoose';
import { CreateDishDto } from './dto/createDish.dto';

@Injectable()
export class DishService {
  constructor(
    @InjectModel(Dish.name) private readonly dishModel: Model<Dish>,
  ) {}

  async createDish(createDishDto: CreateDishDto): Promise<Dish> {
    const newDish = new this.dishModel(createDishDto);
    return newDish.save();
  }
}
