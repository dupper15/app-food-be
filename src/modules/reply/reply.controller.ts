import {
  Controller,
  Post,
  Body,
  Param,
  UseInterceptors,
  UploadedFiles,
  Delete,
} from '@nestjs/common';
import { ReplyService } from './reply.service';
import { Reply } from './reply.schema';
import { CreateReplyDto } from './dto/createReply.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { UploadService } from '../upload/upload.service';

@Controller('reply')
export class ReplyController {
  constructor(
    private readonly replyService: ReplyService,
    private readonly uploadService: UploadService,
  ) {}

  @Post(':id/create')
  @UseInterceptors(FilesInterceptor('images'))
  async createReply(
    @Param('id') id: string,
    @Body() data: CreateReplyDto,
    @UploadedFiles() imagesUpload: Express.Multer.File[],
  ): Promise<Reply> {
    let imageUrls: string[] = [];
    if (imagesUpload?.length) {
      imageUrls = await this.uploadService.uploadMultipleImages(imagesUpload);
      data.images = imageUrls;
    }

    return await this.replyService.createReply(id, data);
  }

  @Delete(':id')
  async deleteReply(@Param('id') id: string): Promise<string> {
    return await this.replyService.deleteReply(id);
  }
}
