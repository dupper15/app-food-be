import { Controller, Post, Body, Param } from '@nestjs/common';
import { ReplyService } from './reply.service';
import { Reply } from './reply.schema';
import { CreateReplyDto } from './dto/createReply.dto';

@Controller('reply')
export class ReplyController {
  constructor(private readonly replyService: ReplyService) {}

  @Post(':id/create')
  async createReply(
    @Param('id') id: string,
    @Body() data: CreateReplyDto,
  ): Promise<Reply> {
    return this.replyService.createReply(id, data);
  }
}
