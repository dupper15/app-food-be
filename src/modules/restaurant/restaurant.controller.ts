import {
  Controller,
  Post,
  Body,
  UseInterceptors,
  UploadedFiles,
  Get,
} from '@nestjs/common';
import { RestaurantService } from './restaurant.service';
import { FilesInterceptor } from '@nestjs/platform-express';
import { UploadService } from '../upload/upload.service';

@Controller('restaurants')
export class RestaurantController {
  constructor(
    private readonly restaurantService: RestaurantService,
    private readonly uploadService: UploadService,
  ) {}

  @Post()
  @UseInterceptors(FilesInterceptor('images'))
  async createRestaurant(
    @Body() body: any,
    @UploadedFiles() images: Express.Multer.File[],
  ) {
    const bannerUrls = await this.uploadService.uploadMultipleImages(images);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    return await this.restaurantService.create({
      ...body,
      banners: bannerUrls,
    });
  }

  @Get()
  async fetchAllRestaurant() {
    return await this.restaurantService.fetchAll();
  }
}
