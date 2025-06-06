import { InjectModel } from '@nestjs/mongoose';
import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { Model } from 'mongoose';
import { Restaurant } from 'src/modules/restaurant/restaurant.schema';
import { CreateRestaurantDto } from './dto/create-restaurant.dto';
import { RestaurantOwner } from '../restaurant-owner/restaurant-owner.schema';
import { UploadService } from '../upload/upload.service';
import { EditRestaurantDto } from './dto/edit-restaurant.dto';
import { TfIdf } from 'natural';
import cosineSimilarity from 'compute-cosine-similarity';
import { OrderService } from '../order/order.service';
import { DishService } from '../dish/dish.service';
import { Voucher } from '../voucher/voucher.schema';
import { GeocodingService } from '../geocoding/geocoding.service';
import { RatingService } from '../rating/rating.service';
import { Dish } from '../dish/dish.schema';

@Injectable()
export class RestaurantService {
  private readonly logger = new Logger(RestaurantService.name);

  constructor(
    @InjectModel(Restaurant.name)
    private readonly restaurantModel: Model<Restaurant>,
    @InjectModel(RestaurantOwner.name)
    private readonly restaurantOwnerModel: Model<RestaurantOwner>,
    @InjectModel(Voucher.name)
    private readonly voucherModel: Model<Voucher>,
    @InjectModel(Dish.name)
    private readonly dishModel: Model<Dish>,
    private readonly uploadService: UploadService,
    private readonly orderService: OrderService,
    private readonly dishService: DishService,
    private readonly geocodingService: GeocodingService,
    private readonly ratingService: RatingService,
  ) {}

  async create(createRestaurantDto: CreateRestaurantDto) {
    const { owner_id, name, description, address, banners } =
      createRestaurantDto;
    const restaurantOwner = await this.restaurantOwnerModel.findById(owner_id);
    if (!restaurantOwner) {
      throw new NotFoundException('Restaurant owner not found');
    }
    restaurantOwner.status = 'Pending';
    await restaurantOwner.save();
    const newRestaurant = new this.restaurantModel({
      owner_id,
      name,
      description,
      address,
      banners,
    });

    // Geocode the address
    try {
      const coordinates = await this.geocodingService.geocodeAddress(address);
      if (coordinates) {
        newRestaurant.latitude = coordinates.latitude;
        newRestaurant.longitude = coordinates.longitude;
        this.logger.log(
          `Geocoded address for restaurant "${name}": ${coordinates.latitude}, ${coordinates.longitude}`,
        );
      }
    } catch (error) {
      this.logger.error(
        `Failed to geocode address for restaurant "${name}"`,
        error,
      );
    }

    return newRestaurant.save();
  }

  async edit(id: string, editData: EditRestaurantDto) {
    // If address is being updated, try to geocode it
    if (editData.address) {
      try {
        const coordinates = await this.geocodingService.geocodeAddress(
          editData.address,
        );
        if (coordinates) {
          editData.latitude = coordinates.latitude;
          editData.longitude = coordinates.longitude;
          this.logger.log(
            `Geocoded updated address for restaurant ID ${id}: ${coordinates.latitude}, ${coordinates.longitude}`,
          );
        }
      } catch (error) {
        this.logger.error(
          `Failed to geocode updated address for restaurant ID ${id}`,
          error,
        );
      }
    }

    const restaurant = await this.restaurantModel.findByIdAndUpdate(
      id,
      editData,
      { new: true },
    );

    return restaurant;
  }

  async findById(id: string): Promise<Restaurant | null> {
    return this.restaurantModel.findById(id).exec();
  }

  async deleteBanner(id: string, imageUrl: string): Promise<Restaurant | null> {
    const restaurant = await this.restaurantModel.findById(id);

    if (!restaurant) {
      throw new NotFoundException('Restaurant not found');
    }

    const updatedBanners = restaurant.banners.filter(
      (bannerUrl: string) => bannerUrl !== imageUrl,
    );

    const updatedRestaurant = await this.restaurantModel.findByIdAndUpdate(
      id,
      { banners: updatedBanners },
      { new: true },
    );

    return updatedRestaurant;
  }

  async fetchAll(): Promise<Restaurant[]> {
    return this.restaurantModel
      .find()
      .populate({
        path: 'owner_id',
        select: 'avatar',
      })
      .exec();
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
    const userDish = await this.orderService.getOrderedDishesByCustomerId(id);
    const restaurant = this.fetchRestaurantsByDishes(userDish);

    return restaurant;
  }

  async fetchRcmRestaurantByUserId(id: string): Promise<Restaurant[]> {
    return this.restaurantModel
      .find()
      .populate({ path: 'owner_id', select: 'avatar phone' })
      .exec();
  }

  async fetchForYouRestaurantByUserId(id: string): Promise<Restaurant[]> {
    const userDish = await this.orderService.getOrderedDishesByCustomerId(id);
    const allDishes = await this.dishService.fetchAllDishNameAndId();
    if (userDish.length > 0 && allDishes.length > 0) {
      const recommendedDishes = this.getRcmDish(userDish, allDishes, 20);
      const restaurant = this.fetchRestaurantsByDishes(recommendedDishes);
      return restaurant;
    } else {
      return this.fetchMultipleDealsRestaurant();
    }
  }

  async fetchNearRestaurantByUserId(id: string): Promise<Restaurant[]> {
    return this.restaurantModel
      .find()
      .populate({ path: 'owner_id', select: 'avatar phone' })
      .exec();
  }

  async fetchMultipleDealsRestaurant(): Promise<Restaurant[]> {
    const restaurantIds = await this.voucherModel.aggregate([
      {
        $match: {
          restaurant_id: { $exists: true, $ne: null },
        },
      },
      {
        $addFields: {
          sortValue: {
            $cond: [
              { $ifNull: ['$value', false] },
              '$value',
              { $ifNull: ['$max', 0] },
            ],
          },
        },
      },
      {
        $sort: {
          restaurant_id: 1,
          sortValue: -1,
        },
      },
      {
        $group: {
          _id: '$restaurant_id',
          topVoucher: { $first: '$$ROOT' },
        },
      },
      {
        $sort: {
          'topVoucher.sortValue': -1,
        },
      },
      {
        $project: {
          _id: 0,
          restaurant_id: '$_id',
        },
      },
    ]);
    const restaurantIdsArray = restaurantIds.map(
      (restaurant: { restaurant_id: string }) => restaurant.restaurant_id,
    );
    const restaurants = await this.restaurantModel
      .find({ _id: { $in: restaurantIdsArray } })
      .populate({ path: 'owner_id', select: 'avatar phone' })
      .exec();
    return restaurants;
  }

  async fetchMultipleBuyerRestaurant(): Promise<Restaurant[]> {
    const restaurants = await this.restaurantModel
      .find({})
      .sort({ total_orders: -1 })
      .exec();
    return restaurants;
  }

  getRcmDish(
    userDishes: {
      _id: string;
      name: string;
      restaurant_id: string;
      rating: number;
    }[],
    allDishes: { _id: string; name: string; restaurant_id: string }[],
    topN = 3,
  ): { _id: string; name: string; restaurant_id: string }[] {
    const tfidf = new TfIdf();

    allDishes.forEach((dish) => {
      tfidf.addDocument(this.normalize(dish.name));
    });
    const userDishMap = new Map<
      string,
      {
        _id: string;
        name: string;
        restaurant_id: string;
        count: number;
        totalRating: number;
      }
    >();

    userDishes.forEach((dish) => {
      const key = dish._id;
      if (!userDishMap.has(key)) {
        userDishMap.set(key, {
          _id: dish._id,
          name: dish.name,
          restaurant_id: dish.restaurant_id,
          count: 1,
          totalRating: dish.rating,
        });
      } else {
        const existing = userDishMap.get(key)!;
        existing.count += 1;
        existing.totalRating += dish.rating;
      }
    });

    const userDishTemp = Array.from(userDishMap.values()).map((d) => ({
      ...d,
      avgRating: d.totalRating / d.count,
    }));
    const userVectors = userDishTemp.map((dish) => {
      const tempTfidf = new TfIdf();
      tempTfidf.addDocument(this.normalize(dish.name));
      const vector = this.getTfIdfVector(tempTfidf, 0, tfidf);

      const weight = dish.count * dish.avgRating;

      return vector.map((v) => v * weight);
    });

    const userProfileVector = this.averageVectors(userVectors);

    const recommended: {
      dish: { _id: string; name: string; restaurant_id: string };
      score: number;
    }[] = [];

    allDishes.forEach((dish, index) => {
      if (userDishes.some((ud) => ud._id === dish._id)) return;

      const dishVector = this.getTfIdfVector(tfidf, index, tfidf);
      let score = cosineSimilarity(userProfileVector, dishVector);
      if (!score) score = 0;
      recommended.push({
        dish: {
          _id: dish._id,
          name: dish.name,
          restaurant_id: dish.restaurant_id,
        },
        score,
      });
    });
    return recommended
      .sort((a, b) => b.score - a.score)
      .slice(0, topN)
      .map((r) => r.dish);
  }

  getTfIdfVector(tfidf: TfIdf, docIndex: number, ref: TfIdf): number[] {
    const terms = tfidf.listTerms(docIndex);

    const allTermsSet = new Set<string>();
    ref.documents.forEach((doc) => {
      Object.keys(doc).forEach((term) => allTermsSet.add(term));
    });
    const allTerms = Array.from(allTermsSet);

    const vector = allTerms.map(
      (term) => terms.find((t) => t.term === term)?.tfidf || 0,
    );

    return vector;
  }

  averageVectors(vectors: number[][]): number[] {
    const len = vectors[0].length;
    const sum = Array(len).fill(0);

    vectors.forEach((vec) => {
      vec.forEach((val, i) => {
        sum[i] += val;
      });
    });

    return sum.map((val) => val / vectors.length);
  }

  customStopWords = [
    'la',
    'co',
    'voi',
    'va',
    'cua',
    'nha',
    'lam',
    'truyen',
    'thong',
    'dac',
    'biet',
    'mon',
    'ngon',
    'an',
  ];

  removeVietnameseStopwords(words: string[], stopWords: string[]) {
    return words.filter((word) => !stopWords.includes(word));
  }

  normalize(text: string) {
    const normalized = text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/[^a-zA-Z0-9\s]/g, '')
      .trim();

    const words = normalized.split(/\s+/);
    const filtered = this.removeVietnameseStopwords(
      words,
      this.customStopWords,
    );
    return filtered.join(' ');
  }

  async fetchRestaurantsByDishes(
    dishes: { _id: string; name: string; restaurant_id: string }[],
  ): Promise<Restaurant[]> {
    const uniqueIds = Array.from(new Set(dishes.map((d) => d.restaurant_id)));

    const restaurants = await this.restaurantModel
      .find({ _id: { $in: uniqueIds } })
      .populate({ path: 'owner_id', select: 'avatar phone' })
      .exec();

    return restaurants;
  }

  async fetchNearRestaurantByLatLng(
    lat: string,
    lng: string,
    maxDistance: number = 5,
  ): Promise<Restaurant[]> {
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);

    if (isNaN(latitude) || isNaN(longitude)) {
      throw new Error('Invalid latitude or longitude');
    }

    const allRestaurants = await this.restaurantModel
      .find({
        latitude: { $exists: true, $ne: null },
        longitude: { $exists: true, $ne: null },
      })
      .populate({ path: 'owner_id', select: 'avatar phone' })
      .exec();

    const restaurantsWithDistance = allRestaurants.map((restaurant) => ({
      restaurant,
      distance: this.calculateDistance(
        latitude,
        longitude,
        restaurant.latitude,
        restaurant.longitude,
      ),
    }));

    const filtered = restaurantsWithDistance
      .filter((r) => r.distance <= maxDistance)
      .sort((a, b) => a.distance - b.distance);

    this.logger.log(
      `Found ${filtered.length} restaurants within ${maxDistance}km of [${latitude}, ${longitude}]`,
    );

    return filtered.map((r) => r.restaurant);
  }

  private calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number {
    const R = 6371;
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) *
        Math.cos(this.deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return distance;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  async fetchAllRestaurantByAdmin(
    page: number,
    limit: number,
    q: string,
  ): Promise<{ data: any[]; total: number }> {
    const skip = (page - 1) * limit;

    const searchCondition = q ? { name: { $regex: q, $options: 'i' } } : {};
    // Lấy danh sách nhà hàng và tổng số lượng
    const [restaurants, total] = await Promise.all([
      this.restaurantModel
        .find({ status: { $in: ['Enable', 'Disable'] }, ...searchCondition })
        .skip(skip)
        .limit(limit)
        .populate({ path: 'owner_id', select: 'avatar' })
        .lean(), // Dùng lean để dễ thao tác dữ liệu
      this.restaurantModel.countDocuments({
        status: { $in: ['Enable', 'Disable'] },
        ...searchCondition,
      }),
    ]);

    // Lấy trung bình đánh giá từng nhà hàng
    const restaurantIds = restaurants.map((r) => r._id);
    const averageRatings = await Promise.all(
      restaurantIds.map(async (id) => {
        const avg = await this.ratingService.fetchAverage(id.toString());
        return { restaurantId: id, average: avg || 0 };
      }),
    );

    const dishCounts = await Promise.all(
      restaurantIds.map(async (id) => {
        const count = await this.dishService.totalDishByRestaurant(
          id.toString(),
        );
        return { restaurantId: id, count: count || 0 };
      }),
    );

    const dishCountMap = new Map(
      dishCounts.map((d) => [d.restaurantId.toString(), d.count]),
    );
    const averageRatingMap = new Map(
      averageRatings.map((r) => [r.restaurantId.toString(), r.average]),
    );

    const data = restaurants.map((r) => {
      const restaurantId = r._id.toString();
      const result = {
        ...r,
        averageRating: averageRatingMap.get(restaurantId) || 0,
        totalDishes: dishCountMap.get(restaurantId) || 0,
      };
      return result;
    });

    return { data, total };
  }

  async changeStatusRestaurant(id: string): Promise<Restaurant> {
    const restaurant = await this.restaurantModel.findById(id);
    if (!restaurant) {
      throw new NotFoundException('Restaurant not found');
    }
    if (restaurant.status === 'Enable') {
      restaurant.status = 'Disable';
    } else {
      restaurant.status = 'Enable';
    }
    return restaurant.save();
  }

  async rejectedRestaurant(id: string): Promise<Restaurant> {
    const restaurant = await this.restaurantModel.findById(id);
    if (!restaurant) {
      throw new NotFoundException('Restaurant not found');
    }
    restaurant.status = 'Rejected';
    return await restaurant.save();
  }

  async approvedRestaurant(id: string): Promise<Restaurant> {
    const restaurant = await this.restaurantModel.findById(id);
    if (!restaurant) {
      throw new NotFoundException('Restaurant not found');
    }
    restaurant.status = 'Enable';

    const owner = await this.restaurantOwnerModel.findById(restaurant.owner_id);
    if (!owner) {
      throw new NotFoundException('Owner not found');
    }
    owner.status = 'Enable';
    await owner.save();
    return await restaurant.save();
  }

  async fetchAllRestaurantPending(): Promise<Restaurant[]> {
    const restaurants = await this.restaurantModel.find().populate({
      path: 'owner_id',
      match: { status: 'Pending' }, // chỉ populate nếu owner status là Pending
    });
    return restaurants.filter((r) => r.owner_id);
  }
}
