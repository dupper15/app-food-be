import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { RestaurantOwner } from './restaurant-owner.schema';

@Injectable()
export class RestaurantOwnerService {
  constructor(
    @InjectModel(RestaurantOwner.name)
    private readonly restaurantOwnerModel: RestaurantOwner,
  ) {}
}
