import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/createCategory.dto';
import { ObjectId } from 'mongoose';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadService } from '../upload/upload.service';

@Controller('categories')
export class CategoryController {
  constructor(
    private readonly categoryService: CategoryService,
    private readonly uploadService: UploadService,
  ) {}

  @Post('create')
  @UseInterceptors(FileInterceptor('images'))
  async createCategoryController(
    @Body() createCategoryDto: CreateCategoryDto,
    @UploadedFile() images: Express.Multer.File,
  ) {
    if (images) {
      const image = await this.uploadService.uploadImage(images);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      createCategoryDto.image = image;
    }
    return await this.categoryService.createCategory(createCategoryDto);
  }

  @Get('fetchall-category')
  async fetchAllCategoryController() {
    return await this.categoryService.fetchAllCategory();
  }

  @Get('fetchall-category-by-admin')
  async fetchAllCategoryByAdminController() {
    return await this.categoryService.fetchAllCategoryByAdmin();
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
