import { Controller } from '@nestjs/common';import { RestaurantOwnerService } from './restaurant-owner.service';

@Controller('restaurant-owners')
export class RestaurantOwnerController {
  constructor(
    private readonly restaurantOwnerService: RestaurantOwnerService,
  ) {}
}
