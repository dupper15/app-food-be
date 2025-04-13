import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/createCategory.dto';
import { ObjectId } from 'mongoose';

@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post('create')
  @UsePipes(new ValidationPipe())
  async createCategoryController(@Body() createCategoryDto: CreateCategoryDto) {
    return await this.categoryService.createCategory(createCategoryDto);
  }

  @Get('fetchall-category')
  async fetchAllCategoryController() {
    return await this.categoryService.fetchAllCategory();
  }

  @Get('fetchall-category-by-restaurant/:id')
  async fetchAllCategoryByRestaurantController(@Param('id') id: ObjectId) {
    return await this.categoryService.fetchAllCategoryByRestaurant(id);
  }

  @Delete('delete/:id')
  async deleteCategoryController(@Param('id') id: ObjectId) {
    return await this.categoryService.deleteCategory(id);
  }

  @Get('fetch-restaurant-have-category/:id')
  async fetchRestaurantHaveCategory(@Param('id') id: ObjectId): Promise<any> {
    return await this.categoryService.fetchRestaurantHaveCategory(id);
  }
}
