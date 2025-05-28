import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  UseInterceptors,
  UploadedFiles,
  Query,
} from '@nestjs/common';
import { ReflectService } from './reflect.service';
import { Reflect } from './reflect.schema';
import { FilesInterceptor } from '@nestjs/platform-express';
import { UploadService } from '../upload/upload.service';

@Controller('reflect')
export class ReflectController {
  constructor(
    private readonly reflectService: ReflectService,
    private readonly uploadService: UploadService,
  ) {}

  @Post('create')
  @UseInterceptors(FilesInterceptor('reflects'))
  async createReflect(
    @Body() data: any,
    @UploadedFiles() reflects: Express.Multer.File[],
  ): Promise<Reflect> {
    const updateData = { ...data };

    let reflectsRemaining: string[] = [];

    if (Array.isArray(data.reflectsRemaining)) {
      reflectsRemaining = data.reflectsRemaining;
    } else if (typeof data.reflectsRemaining === 'string') {
      reflectsRemaining = [data.reflectsRemaining];
    }

    let newReflectsUrls: string[] = [];
    if (reflects && reflects.length > 0) {
      newReflectsUrls = await this.uploadService.uploadMultipleImages(reflects);
    }

    updateData.images = [...reflectsRemaining, ...newReflectsUrls];

    return this.reflectService.createReflect(updateData);
  }

  @Get('all')
  async fetchAllReflect(): Promise<Reflect[]> {
    return this.reflectService.fetchAllReflect();
  }

  @Get('customer/:id')
  async fetchReflectByCustomer(@Param('id') id: string): Promise<Reflect[]> {
    return this.reflectService.fetchReflectByCustomer(id);
  }

  @Post('reply/:id')
  async reply(
    @Param('id') id: string,
    @Body('message') message: string,
  ): Promise<Reflect> {
    return this.reflectService.reply(id, message);
  }

  @Get('by-admin')
  async fetchAllReflectByAdmin(
    @Query('page') page: 1,
    @Query('limit') limit: 2,
  ): Promise<{ data: Reflect[]; total: number }> {
    return this.reflectService.fetchAllReflectByAdmin(page, limit);
  }
}
