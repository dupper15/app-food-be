import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { SearchService } from './search.service';
import { UploadService } from '../upload/upload.service';
import { FilesInterceptor } from '@nestjs/platform-express';

@Controller('search')
export class SearchController {
  constructor(
    private readonly searchService: SearchService,
    private readonly uploadService: UploadService,
  ) {}
  @Get('text')
  getTextSearch(@Query('query') query: string) {
    return this.searchService.getTextSearch(query);
  }
  @Post('image')
  @UseInterceptors(FilesInterceptor('image'))
  async getImageSearch(@UploadedFiles() image: Express.Multer.File[]) {
    const url = await this.uploadService.uploadMultipleImages(image);
    return this.searchService.getImageSearch(url[0]);
  }
  @Post('test_image')
  getf(@Body() body: { query: string }) {
    const { query } = body;
    return this.searchService.getf(query);
  }
}
