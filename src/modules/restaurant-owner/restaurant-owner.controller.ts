import {
  Body,
  Controller,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { RestaurantOwnerService } from './restaurant-owner.service';
import { RestaurantOwner } from './restaurant-owner.schema';
import { UserController } from './../user/user.controller';
import { RegisterRestaurantDto } from './dto/register-restaurant.dto';

@Controller('restaurant_owners')
export class RestaurantOwnerController extends UserController<RestaurantOwner> {
  constructor(private readonly restaurantOwnerService: RestaurantOwnerService) {
    super(restaurantOwnerService);
  }

  @Post('')
  @UsePipes(new ValidationPipe())
  async register(@Body() registerRestaurantOwnerDto: RegisterRestaurantDto) {
    return await this.restaurantOwnerService.register(
      registerRestaurantOwnerDto,
    );
  }
}
