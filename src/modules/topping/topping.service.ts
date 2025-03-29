import { BadRequestException, Injectable } from '@nestjs/common';
import { Topping } from './topping.schema';
import { InjectModel } from '@nestjs/mongoose';
import { AddToppingDto } from './dto/addTopping.dto';
import { Model, ObjectId } from 'mongoose';
import { Restaurant } from '../restaurant/restaurant.schema';
import { EditToppingDto } from './dto/editTopping.dto';

@Injectable()
export class ToppingService {
  constructor(
    @InjectModel(Topping.name) private readonly toppingModel: Model<Topping>,
    @InjectModel(Restaurant.name)
    private readonly restaurantModel: Model<Restaurant>,
  ) {}

  async addTopping(addToppingDto: AddToppingDto): Promise<Topping> {
    const { restaurant_id, name, price, image } = addToppingDto;

    //check restaurant
    const checkRestaurant = await this.restaurantModel.findById(restaurant_id);
    if (!checkRestaurant) {
      throw new BadRequestException('Restaurant not found');
    }

    const newTopping = new this.toppingModel({
      restaurant_id,
      name,
      price,
      image,
    });

    try {
      return await newTopping.save();
    } catch {
      throw new BadRequestException(
        'Topping cannot be added. Please try again.',
      );
    }
  }

  async editTopping(
    id: ObjectId,
    editToppingDto: EditToppingDto,
  ): Promise<Topping> {
    const { name, price, image } = editToppingDto;

    // find topping to update
    const updatedTopping = await this.toppingModel.findByIdAndUpdate(
      id,
      { name, price, image },
      { new: true, runValidators: true },
    );

    //check updated topping
    if (!updatedTopping) {
      throw new BadRequestException('Topping not found');
    }

    return updatedTopping;
  }

  async deleteTopping(id: ObjectId): Promise<{ msg: string }> {
    //find topping to delete
    const deletedTopping = await this.toppingModel.findById(id);

    //check topping
    if (!deletedTopping) {
      throw new BadRequestException('Topping not found');
    }

    //delete
    await this.toppingModel.findByIdAndDelete(id);

    return { msg: 'Topping deleted successfully' };
  }

  async getAllTopping(id: ObjectId): Promise<Topping[]> {
    return await this.toppingModel.find({ restaurant_id: id }).exec();
  }

  async getToppingById(id: ObjectId): Promise<Topping> {
    const topping = await this.toppingModel.findById(id).exec();
    if (!topping) {
      throw new BadRequestException('Topping not found');
    }
    return topping;
  }

  async getToppingByIdArray(idArray: ObjectId[]): Promise<Topping[]> {
    const toppings = await this.toppingModel.find({
      _id: { $in: idArray },
    });
    if (!toppings) {
      throw new BadRequestException('Topping not found');
    }
    return toppings;
  }
}
