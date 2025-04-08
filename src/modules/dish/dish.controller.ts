import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UploadedFile,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { DishService } from './dish.service';
import { CreateDishDto } from './dto/createDish.dto';
import { ObjectId } from 'mongoose';
import { EditDishDto } from './dto/editDish.dto';
import { UploadService } from '../upload/upload.service';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('dish')
export class DishController {
  constructor(
    private readonly dishService: DishService,
    private readonly uploadService: UploadService,
  ) {}

  @Post('create')
  @UsePipes(new ValidationPipe({ transform: true }))
  @UseInterceptors(FileInterceptor('image'))
  async createDishController(
    @Body() createDishDto: CreateDishDto,
    @UploadedFile() imageUpload: Express.Multer.File,
  ) {
    const image = await this.uploadService.uploadImage(imageUpload);
    return await this.dishService.createDish({
      ...createDishDto,
      image,
    });
  }

  @Put('edit/:id')
  @UsePipes(new ValidationPipe({ transform: true }))
  @UseInterceptors(FileInterceptor('image'))
  async editDishController(
    @Param('id') id: string,
    @Body() editDishDto: EditDishDto,
    @UploadedFile() imageUpload: Express.Multer.File,
  ) {
    const updateData = { ...editDishDto };

    if (imageUpload) {
      const uploadImageUrl = await this.uploadService.uploadImage(imageUpload);
      updateData.image = uploadImageUrl;
    }

    return await this.dishService.editDish(id, updateData);
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
