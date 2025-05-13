import { Injectable, Logger } from '@nestjs/common';import { spawn } from 'child_process';
import { Order } from '../order/order.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Restaurant } from '../restaurant/restaurant.schema';
import { Model } from 'mongoose';
import { Dish } from '../dish/dish.schema';
import { resolve } from 'path';
import { OrderItem } from '../order-item/orderItem.schema';

@Injectable()
export class RecommendService {
  private readonly logger = new Logger(RecommendService.name);

  constructor(
    @InjectModel(Restaurant.name)
    private readonly restaurantModel: Model<Restaurant>,
    @InjectModel(Dish.name)
    private readonly dishModel: Model<Dish>,
    @InjectModel(OrderItem.name)
    private readonly orderItemModel: Model<OrderItem>,
  ) {}

  async getRecommendRestaurant(
    customerId: string,
    orders: Order[],
  ): Promise<string[]> {
    try {
      this.logger.log(`Generating recommendations for customer: ${customerId}`);

      const scriptPath = resolve(
        __dirname,
        '../../../src/modules/recommend-system/recommend.py',
      );

      const allRestaurants = await this.restaurantModel.find().lean().exec();
      this.logger.log(`Found ${allRestaurants.length} restaurants total`);

      const userDishMap: Record<string, Set<string>> = {};

      for (const order of orders) {
        const restaurantId = order.restaurant_id.toString();
        const arr_item = order.array_item || [];

        for (const item of arr_item) {
          const itemOrder = await this.orderItemModel
            .findById(item)
            .populate('dish_id', 'name')
            .lean()
            .exec();

          if (!itemOrder) continue;
          const dish = await this.dishModel.findById(itemOrder.dish_id);
          const dishName = dish?.name;

          if (dishName) {
            if (!userDishMap[restaurantId]) {
              userDishMap[restaurantId] = new Set<string>();
            }
            userDishMap[restaurantId].add(dishName);
          }
        }
      }

      this.logger.log('Preparing restaurant data for Python script');

      const restaurantData = await Promise.all(
        allRestaurants.map(async (restaurant) => {
          const restaurantIdString = restaurant._id.toString();

          const allDishInRestaurant = await this.dishModel
            .find({ restaurant_id: restaurantIdString })
            .select('name')
            .lean()
            .exec();

          const dishNames = allDishInRestaurant.map((dish) => dish.name);

          const userDishes = Array.from(userDishMap[restaurantIdString] || []);

          return {
            restaurantId: restaurantIdString,
            name: restaurant.name,
            user_dishes: userDishes,
            dishes: dishNames,
          };
        }),
      );

      this.logger.log(`Prepared data for ${restaurantData.length} restaurants`);
      this.logger.debug(JSON.stringify(restaurantData, null, 2));

      return new Promise((resolve, reject) => {
        this.logger.log(`Spawning Python process: ${scriptPath}`);

        const pythonProcess = spawn('python', [scriptPath]);

        let dataString = '';
        let errorString = '';

        pythonProcess.stdout.on('data', (data) => {
          dataString += data.toString();
        });

        pythonProcess.stderr.on('data', (data) => {
          errorString += data.toString();
          this.logger.debug(`Python stderr: ${data.toString()}`);
        });

        pythonProcess.on('close', (code) => {
          if (code !== 0) {
            this.logger.error(`Python process exited with code ${code}`);
            this.logger.error(`Python error output: ${errorString}`);
            return resolve([]); // Return empty array instead of rejecting
          }

          try {
            // Clean the output string
            const cleanData = dataString.trim();
            this.logger.debug(`Python output: ${cleanData}`);

            // Parse the JSON result
            const result = JSON.parse(cleanData);
            this.logger.log(
              `Successfully parsed recommendations: ${result.length} items`,
            );
            resolve(result);
          } catch (err) {
            this.logger.error(`Error parsing Python result: ${err.message}`);
            this.logger.error(`Raw output was: ${dataString}`);
            resolve([]); // Return empty array on parse error
          }
        });

        // Handle any errors with the Python process
        pythonProcess.on('error', (err) => {
          this.logger.error(`Failed to start Python process: ${err.message}`);
          resolve([]);
        });

        // Send data to Python script
        const inputData = JSON.stringify(restaurantData);
        this.logger.debug(`Sending data to Python (${inputData.length} bytes)`);

        try {
          pythonProcess.stdin.write(inputData);
          pythonProcess.stdin.end();
        } catch (err) {
          this.logger.error(`Error writing to Python stdin: ${err.message}`);
          resolve([]);
        }
      });
    } catch (error) {
      this.logger.error('Error in recommendation service:', error);
      return [];
    }
  }
}
