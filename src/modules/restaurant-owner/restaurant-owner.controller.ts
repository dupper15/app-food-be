import {
  Body,
  Controller,
  Param,
  Post,
  Put,
  UploadedFile,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { RestaurantOwnerService } from './restaurant-owner.service';
import { RestaurantOwner } from './restaurant-owner.schema';
import { UserController } from './../user/user.controller';
import { RegisterRestaurantDto } from './dto/register-restaurant.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadService } from '../upload/upload.service';

@Controller('restaurant_owners')
export class RestaurantOwnerController extends UserController<RestaurantOwner> {
  constructor(
    private readonly restaurantOwnerService: RestaurantOwnerService,
    private readonly uploadService: UploadService,
  ) {
    super(restaurantOwnerService);
  }

  @Post('')
  @UsePipes(new ValidationPipe())
  async register(@Body() registerRestaurantOwnerDto: RegisterRestaurantDto) {
    return await this.restaurantOwnerService.register(
      registerRestaurantOwnerDto,
    );
  }
  @Put(':id')
  @UseInterceptors(FileInterceptor('images'))
  async edit(
    @Param('id') id: string,
    @Body() data: any,
    @UploadedFile() images: Express.Multer.File,
  ) {
    console.log(data, images);
    if (images) {
      const avatar = await this.uploadService.uploadImage(images);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      data.avatar = avatar;
    }
    return await this.restaurantOwnerService.edit(id, data);
  }
}
