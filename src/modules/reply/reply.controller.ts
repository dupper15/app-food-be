import { Controller, Post, Body } from '@nestjs/common';
import { ReplyService } from './reply.service';
import { Reply } from './reply.schema';

@Controller('reply')
export class ReplyController {
  constructor(private readonly replyService: ReplyService) {}

  @Post('create')
  async createReply(@Body() data: Partial<Reply>): Promise<Reply> {
    return this.replyService.createReply(data);
  }
}
