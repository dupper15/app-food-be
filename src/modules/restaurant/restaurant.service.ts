import { InjectModel } from '@nestjs/mongoose';import { Injectable, NotFoundException } from '@nestjs/common';
import { Model } from 'mongoose';
import { Restaurant } from 'src/modules/restaurant/restaurant.schema';
import { CreateRestaurantDto } from './dto/create-restaurant.dto';
import { RestaurantOwner } from '../restaurant-owner/restaurant-owner.schema';
import { UploadService } from '../upload/upload.service';

@Injectable()
export class RestaurantService {
  constructor(
    @InjectModel(Restaurant.name)
    private readonly restaurantModel: Model<Restaurant>,
    @InjectModel(RestaurantOwner.name)
    private readonly restaurantOwnerModel: Model<RestaurantOwner>,
    private readonly uploadService: UploadService,
  ) {}
  async create(createRestaurantDto: CreateRestaurantDto) {
    const { owner_id, name, description, address, banners } =
      createRestaurantDto;

    const newRestaurant = new this.restaurantModel({
      owner_id,
      name,
      description,
      address,
      banners,
    });

    return newRestaurant.save();
  }

  async fetchAll(): Promise<Restaurant[]> {
    return this.restaurantModel.find().exec();
  }

  async fetchDetailRestaurant(id: string): Promise<Restaurant> {
    const restaurant = await this.restaurantModel.findById(id).exec();
    if (!restaurant) {
      throw new NotFoundException(`Restaurant with ID ${id} not found`);
    }
    return restaurant;
  }

  async fetchDetailRestaurantByOwner(id: string): Promise<Restaurant> {
    const restaurant = await this.restaurantModel
      .findOne({ owner_id: id })
      .exec();
    if (!restaurant) {
      throw new NotFoundException(`Restaurant with ID ${id} not found`);
    }
    return restaurant;
  }

  async fetchHistoryRestaurantByUserId(id: string): Promise<Restaurant[]> {
    return this.restaurantModel
      .find()
      .populate({ path: 'owner_id', select: 'avatar phone' })
      .exec();
  }

  async fetchRcmRestaurantByUserId(id: string): Promise<Restaurant[]> {
    return this.restaurantModel
      .find()
      .populate({ path: 'owner_id', select: 'avatar phone' })
      .exec();
  }
  async fetchForYouRestaurantByUserId(id: string): Promise<Restaurant[]> {
    return this.restaurantModel
      .find()
      .populate({ path: 'owner_id', select: 'avatar phone' })
      .exec();
  }
  async fetchNearRestaurantByUserId(id: string): Promise<Restaurant[]> {
    return this.restaurantModel
      .find()
      .populate({ path: 'owner_id', select: 'avatar phone' })
      .exec();
  }
  async fetchMultipleDealsRestaurant(): Promise<Restaurant[]> {
    return this.restaurantModel
      .find()
      .populate({ path: 'owner_id', select: 'avatar phone' })
      .exec();
  }
  async fetchMultipleBuyerRestaurant(): Promise<Restaurant[]> {
    return this.restaurantModel
      .find()
      .populate({ path: 'owner_id', select: 'avatar phone' })
      .exec();
  }
}
