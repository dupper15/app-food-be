import {  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UploadedFiles,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { CustomerService } from './customer.service';
import { RegisterCustomerDto } from './dto/register-customer.dto';
import { UserController } from '../user/user.controller';
import { Customer } from './customer.schema';
import { FilesInterceptor } from '@nestjs/platform-express';
import { UploadService } from '../upload/upload.service';

@Controller('customers')
export class CustomersController extends UserController<Customer> {
  constructor(
    private readonly customerService: CustomerService,
    private readonly uploadService: UploadService,
  ) {
    super(customerService);
  }

  @Post('')
  @UsePipes(new ValidationPipe())
  async register(@Body() registerCustomerDto: RegisterCustomerDto) {
    return await this.customerService.register(registerCustomerDto);
  }
  @Get(':id')
  async getDetailCustomerById(@Param('id') userId: string) {
    return await this.customerService.getDetailCustomerById(userId);
  }
  @Post(':id/favorite-restaurant/:restaurantId')
  async addFavoriteRestaurant(
    @Param('id') userId: string,
    @Param('restaurantId') restaurantId: string,
  ) {
    return await this.customerService.addFavoriteRestaurant(
      userId,
      restaurantId,
    );
  }
  @Delete(':id/favorite-restaurant/:restaurantId')
  async removeFavoriteRestaurant(
    @Param('id') userId: string,
    @Param('restaurantId') restaurantId: string,
  ) {
    return await this.customerService.removeFavoriteRestaurant(
      userId,
      restaurantId,
    );
  }
  @Get(':id/favorite-restaurant')
  async getFavoriteRestaurants(@Param('id') userId: string) {
    return this.customerService.getFavoriteRestaurants(userId);
  }
  @Get(':id/favorite-restaurant-ids')
  async getFavoriteRestaurantIds(@Param('id') userId: string) {
    return this.customerService.getFavoriteRestaurantIds(userId);
  }
  @Post(':id/address')
  async addAddress(
    @Param('id') userId: string,
    @Body() body: { address: string },
  ) {
    return this.customerService.addAddress(userId, body.address);
  }
  @Get(':id/address')
  async getAddresses(@Param('id') userId: string) {
    return this.customerService.getAddressTrim(userId);
  }
  @Put(':id/address')
  async editAddress(
    @Param('id') userId: string,
    @Body() body: { address: string; prevAddress: string },
  ) {
    const { address, prevAddress } = body;
    return this.customerService.editAddress(userId, address, prevAddress);
  }
  @Delete(':id/address')
  async removeAddress(
    @Param('id') userId: string,
    @Body() body: { address: string },
  ) {
    const { address } = body;
    return this.customerService.removeAddress(userId, address);
  }

  @Get(':id/points')
  async getPoints(@Param('id') userId: string) {
    return this.customerService.getPoints(userId);
  }
  @Get(':id')
  async getCustomerInfo(@Param('id') userId: string) {
    return this.customerService.getCustomerInfo(userId);
  }
  @Put(':id')
  @UseInterceptors(FilesInterceptor('avatar'))
  async editCustomerInfo(
    @Param('id') userId: string,
    @Body() data: any,
    @UploadedFiles() avatar: Express.Multer.File[],
  ) {
    let avatarUrl;

    if (avatar && avatar.length > 0) {
      const urls = await this.uploadService.uploadMultipleImages(avatar);
      avatarUrl = urls[0];
    }

    const updatedData: any = {
      ...data.editUser,
      ...(avatarUrl && { avatar: avatarUrl }),
    };

    return this.customerService.editCustomerInfo(userId, updatedData);
  }
}
