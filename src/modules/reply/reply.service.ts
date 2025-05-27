import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Reply, ReplyDocument } from './reply.schema';
import { Rating } from '../rating/rating.schema';
import { CreateReplyDto } from './dto/createReply.dto';

@Injectable()
export class ReplyService {
  constructor(
    @InjectModel(Reply.name) private replyModel: Model<ReplyDocument>,
    @InjectModel(Rating.name) private ratingModel: Model<Rating>,
  ) {}

  async createReply(id: string, data: CreateReplyDto): Promise<Reply> {
    if (!data.content || data.content.trim() === '') {
      throw new BadRequestException('Reply content is required.');
    }

    const rating = await this.ratingModel.findById(id).exec();
    if (!rating) {
      throw new NotFoundException(`Rating with ID ${id} not found`);
    }
    const reply = await this.replyModel.create(data);
    rating.replies_array.push(reply._id as Types.ObjectId);
    await rating.save();
    return reply;
  }

  async findReplyById(id: string): Promise<Reply> {
    const reply = await this.replyModel.findById(id).exec();
    if (!reply) {
      throw new Error('Reply not found');
    }
    return reply;
  }
}
