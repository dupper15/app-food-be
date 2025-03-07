import { Injectable, NotFoundException } from '@nestjs/common';import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Rating, RatingDocument } from './rating.schema';
import { CreateRatingDto } from './dto/createRating';

@Injectable()
export class RatingService {
  constructor(
    @InjectModel(Rating.name) private ratingModel: Model<RatingDocument>,
  ) {}

  async createRating(createRatingDto: CreateRatingDto): Promise<Rating> {
    return this.ratingModel.create(createRatingDto);
  }

  async fetchAllRatingsByRestaurant(restaurantId: string): Promise<Rating[]> {
    return this.ratingModel
      .find({ restaurant_id: restaurantId })
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
