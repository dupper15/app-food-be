import {  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { DishService } from './dish.service';
import { CreateDishDto } from './dto/createDish.dto';
import { ObjectId } from 'mongoose';
import { EditDishDto } from './dto/editDish.dto';

@Controller('dish')
export class DishController {
  constructor(private readonly dishService: DishService) {}

  @Post('create')
  @UsePipes(new ValidationPipe())
  async createDishController(@Body() createDishDto: CreateDishDto) {
    return await this.dishService.createDish(createDishDto);
  }

  @Put('edit/:id')
  @UsePipes(new ValidationPipe())
  async editDishController(
    @Param('id') id: ObjectId,
    @Body() editDishDto: EditDishDto,
  ) {
    return await this.dishService.editDish(id, editDishDto);
  }

  @Delete('delete/:id')
  async deleteDishController(@Param('id') id: ObjectId) {
    return await this.dishService.deleteDish(id);
  }

  @Get('get-restaurant-by-dish/:id')
  async getRestaurantByDish(@Param('id') id: ObjectId) {
    return await this.dishService.getRestaurantByDish(id);
  }

  @Get('fetchall-dish-by-restaurant/:id')
  async fetchAllDishByRestaurantController(@Param('id') id: ObjectId) {
    return await this.dishService.fetchAllDishByRestaurant(id);
  }

  @Get('fetch-detail-dish/:id')
  async fetchDetailDishController(@Param('id') id: ObjectId) {
    return await this.dishService.fetchDetailDish(id);
  }

  @Get('fetchall-dish-category-by-restaurant/:restaurant_id/:category_id')
  async fetchAllDishCategoryByRestaurantController(
    @Param('restaurant_id') restaurant_id: ObjectId,
    @Param('category_id') category_id: ObjectId,
  ) {
    return await this.dishService.fetchAllDishCategoryByRestaurant(
      restaurant_id,
      category_id,
    );
  }
}
