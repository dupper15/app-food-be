import {
  Controller,
  Post,
  Body,
  UseInterceptors,
  UploadedFiles,
  Get,
  Param,
  Put,
  Query,
  Patch,
} from '@nestjs/common';
import { RestaurantService } from './restaurant.service';
import { FilesInterceptor } from '@nestjs/platform-express';
import { UploadService } from '../upload/upload.service';
import { EditRestaurantDto } from './dto/edit-restaurant.dto';
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

  @Put('edit/:id')
  @UseInterceptors(FilesInterceptor('banners'))
  async editRestaurant(
    @Param('id') id: string,
    @Body() body: EditRestaurantDto,
    @UploadedFiles() banners: Express.Multer.File[],
  ) {
    const updateData = { ...body };

    let bannersRemaining: string[] = [];

    if (Array.isArray(body.bannersRemaining)) {
      bannersRemaining = body.bannersRemaining;
    } else if (typeof body.bannersRemaining === 'string') {
      // Trường hợp chỉ có 1 image => vẫn cần đưa về mảng
      bannersRemaining = [body.bannersRemaining];
    }

    let newBannerUrls: string[] = [];
    if (banners && banners.length > 0) {
      newBannerUrls = await this.uploadService.uploadMultipleImages(banners);
    }

    updateData.banners = [...bannersRemaining, ...newBannerUrls];

    return await this.restaurantService.edit(id, updateData);
  }

  @Put('delete-banner/:id')
  async deleteBannerRestaurant(
    @Param('id') id: string,
    @Body() imageUrl: string,
  ) {
    return await this.restaurantService.deleteBanner(id, imageUrl);
  }

  @Get('near')
  async fetchNearRestaurantByLatLng(
    @Query('lat') lat: string,
    @Query('lng') lng: string,
    @Query('maxDistance') maxDistance: string,
  ) {
    return await this.restaurantService.fetchNearRestaurantByLatLng(
      lat,
      lng,
      Number(maxDistance),
    );
  }

  @Get()
  async fetchAllRestaurant() {
    return await this.restaurantService.fetchAll();
  }
  @Get('multiple-deals')
  async fetchMultipleDealsRestaurant() {
    return await this.restaurantService.fetchMultipleDealsRestaurant();
  }
  @Get('multiple-buyers')
  async fetchMultipleBuyerRestaurant() {
    return await this.restaurantService.fetchMultipleBuyerRestaurant();
  }

  @Get('by-admin')
  async fetchAllRestaurantByAdmin(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return await this.restaurantService.fetchAllRestaurantByAdmin(page, limit);
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

  @Get('recommended/:id')
  async fetchRcmRestaurantByUserId(@Param('id') id: string) {
    return await this.restaurantService.fetchRcmRestaurantByUserId(id);
  }
  @Get('for-you/:id')
  async fetchForYouRestaurantByUserId(@Param('id') id: string) {
    return await this.restaurantService.fetchForYouRestaurantByUserId(id);
  }
  @Get('nearby/:id')
  async fetchNearRestaurantByUserId(@Param('id') id: string) {
    return await this.restaurantService.fetchNearRestaurantByUserId(id);
  }
  @Patch('change-status/:id')
  async changeStatusRestaurant(@Param('id') id: string) {
    return await this.restaurantService.changeStatusRestaurant(id);
  }
}
