import { Injectable, NotFoundException } from '@nestjs/common';import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Rating, RatingDocument } from './rating.schema';
import { CreateRatingDto } from './dto/createRating';

@Injectable()
export class RatingService {
  constructor(
    @InjectModel(Rating.name) private ratingModel: Model<RatingDocument>,
    @InjectModel('Order') private orderModel: Model<any>, // Inject Order model
  ) {}

  async createRating(createRatingDto: CreateRatingDto): Promise<Rating> {
    const order = await this.orderModel.findById(createRatingDto.order_id);
    if (!order) {
      throw new NotFoundException(
        `Order with ID ${createRatingDto.order_id} not found`,
      );
    }

    const ratingData = {
      ...createRatingDto,
      restaurant_id: order.restaurant_id,
    };

    return this.ratingModel.create(ratingData);
  }

  async fetchAllRatingsByRestaurant(restaurant_id: string): Promise<Rating[]> {
    const restaurantObjectId = new Types.ObjectId(restaurant_id);

    return this.ratingModel
      .find({ restaurant_id: restaurantObjectId })
      .populate('replies_array')
      .exec();
  }

  async fetchDetailRating(id: string): Promise<Rating> {
    const rating = await this.ratingModel
      .findById(id)
      .populate('replies_array')
      .exec();
    if (!rating) throw new NotFoundException('Rating not found');
    return rating;
  }

  async deleteRating(id: string): Promise<{ msg: string }> {
    const deleted = await this.ratingModel.findByIdAndDelete(id);
    if (!deleted) throw new NotFoundException('Rating not found');
    return { msg: 'Rating deleted successfully' };
  }
}
