import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Dish } from '../dish/dish.schema';
import { Model } from 'mongoose';
import { Restaurant } from '../restaurant/restaurant.schema';
import Fuse from 'fuse.js';
import { ChatBotService } from '../chatbot/chatbot.service';
@Injectable()
export class SearchService {
  constructor(
    @InjectModel(Dish.name) private readonly dishModel: Model<Dish>,
    @InjectModel(Restaurant.name)
    private readonly restaurantModel: Model<Restaurant>,
    private readonly chatBotService: ChatBotService,
  ) {}
  async getTextSearch(query: string): Promise<Restaurant[]> {
    const dishes = await this.dishModel
      .find()
      .populate({
        path: 'restaurant_id',
        populate: { path: 'owner_id' },
      })
      .populate('category_id', 'name');

    const restaurants = await this.restaurantModel.find().populate('owner_id');

    const dishData = dishes.map((item) => {
      const json: any = item.toJSON();
      return {
        ...json,
        type: 'dish',
        _search_name: json.name,
        _search_category: json.category_id?.name || '',
        _search_restaurant: json.restaurant_id?.name || '',
        _original_restaurant: json.restaurant_id,
      };
    });

    const restaurantData = restaurants.map((item) => {
      const json = item.toJSON();
      return {
        ...json,
        type: 'restaurant',
        _search_name: json.name,
        _search_category: '',
        _search_restaurant: '',
      };
    });

    const data = [...dishData, ...restaurantData];
    const fuse = new Fuse(data, {
      keys: [
        { name: '_search_name', weight: 1 },
        { name: '_search_category', weight: 0.5 },
        { name: '_search_restaurant', weight: 0.7 },
      ],
      threshold: 0.5,
    });

    const result = fuse.search(query);
    const matchedRestaurants = new Map<string, Restaurant>();

    for (const item of result) {
      const doc: any = item.item;

      if (doc.type === 'dish' && doc._original_restaurant) {
        matchedRestaurants.set(
          doc._original_restaurant._id.toString(),
          doc._original_restaurant,
        );
      } else if (doc.type === 'restaurant') {
        matchedRestaurants.set(doc._id.toString(), doc as Restaurant);
      }
    }

    return Array.from(matchedRestaurants.values());
  }
  async getImageSearch(url: string): Promise<string> {
    const prompt =
      "Đây là một món ăn, hãy cho tôi biết tên món ăn này, trả về câu trả lời ngắn gọn theo form này (ví dụ 1: 'Phở bò', ví dụ 2: 'Bánh mì', ví dụ 3: 'Cơm sườn)";
    const dishName = await this.chatBotService.generateTextFromImage(
      url,
      prompt,
    );
    return dishName;
  }
}
