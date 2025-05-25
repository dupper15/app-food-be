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
    const restaurantObjectId = new Types.ObjectId(order.restaurant_id);
    const ratingData = {
      ...createRatingDto,
      restaurant_id: restaurantObjectId,
    };

    return this.ratingModel.create(ratingData);
  }

  async updateRating(
    id: string,
    updateRatingDto: Partial<CreateRatingDto>,
  ): Promise<Rating> {
    const rating = await this.ratingModel.findByIdAndUpdate(
      id,
      updateRatingDto,
      { new: true },
    );
    if (!rating) throw new NotFoundException('Rating not found');
    return rating;
  }

  async fetchAllRatingsByRestaurant(restaurant_id: string): Promise<Rating[]> {
    const restaurantObjectId = new Types.ObjectId(restaurant_id);
    const rating = await this.ratingModel
      .find({ restaurant_id: restaurantObjectId })
      .populate('replies_array')
      .exec();
    console.log('rating', rating);
    return this.ratingModel
      .find({ restaurant_id: restaurantObjectId })
      .populate('replies_array')
      .populate('customer_id', 'name avatar')
      .populate({
        path: 'restaurant_id',
        select: 'name',
        populate: {
          path: 'owner_id',
          select: 'avatar',
        },
      })
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

  async fetchRatingByOrderId(order_id: string): Promise<Rating> {
    const rating = await this.ratingModel.findOne({ order_id }).exec();
    if (!rating) throw new NotFoundException('Rating not found');
    return rating;
  }

  async fetchAverage(restaurantId: string): Promise<number> {
    const ratings = await this.ratingModel
      .find({ restaurant_id: restaurantId })
      .exec();
    if (!ratings) throw new NotFoundException('Rating not found');

    const totalRating: number = ratings.reduce(
      (acc: number, rating) => acc + (rating.rating ?? 0),
      0,
    );
    const averageRating = totalRating / ratings.length;
    return averageRating || 0;
  }
}
