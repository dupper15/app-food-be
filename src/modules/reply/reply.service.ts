import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Reply, ReplyDocument } from './reply.schema';

@Injectable()
export class ReplyService {
  constructor(
    @InjectModel(Reply.name) private replyModel: Model<ReplyDocument>,
  ) {}

  async createReply(data: Partial<Reply>): Promise<Reply> {
    return this.replyModel.create(data);
  }

  async findReplyById(id: string): Promise<Reply> {
    const reply = await this.replyModel.findById(id).exec();
    if (!reply) {
      throw new Error('Reply not found');
    }
    return reply;
  }
}
