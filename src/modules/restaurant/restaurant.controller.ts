import {
  Controller,
  Post,
  Body,
  UseInterceptors,
  UploadedFiles,
  Get,
  Param,
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

  @Get(':id')
  async fetchRestaurantById(@Param('id') id: string) {
    return await this.restaurantService.fetchDetailRestaurant(id);
  }

  @Get('owner/:id')
  async fetchRestaurantByOwner(@Param('id') id: string) {
    return await this.restaurantService.fetchDetailRestaurantByOwner(id);
  }

  @Get('history/:id')
  async fetchHistoryRestaurantByUserId(@Param('id') id: string) {
    return await this.restaurantService.fetchHistoryRestaurantByUserId(id);
  }

  @Get('rcm/:id')
  async fetchRcmRestaurantByUserId(@Param('id') id: string) {
    return await this.restaurantService.fetchRcmRestaurantByUserId(id);
  }
}
