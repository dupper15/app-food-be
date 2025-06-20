import { Injectable } from '@nestjs/common';import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Reflect, ReflectDocument } from './reflect.schema';
import { CreateReflectDto } from './dto/createReflect';
import { Reply, ReplyDocument } from '../reply/reply.schema';

@Injectable()
export class ReflectService {
  constructor(
    @InjectModel(Reflect.name) private reflectModel: Model<ReflectDocument>,
    @InjectModel(Reply.name) private replyModel: Model<ReplyDocument>,
  ) {}

  async createReflect(createReflectDto: CreateReflectDto): Promise<Reflect> {
    return this.reflectModel.create(createReflectDto);
  }

  async fetchAllReflect(): Promise<Reflect[]> {
    return this.reflectModel
      .find()
      .populate([{ path: 'replies_array' }, { path: 'customer_id' }])
      .exec();
  }

  async fetchReflectByCustomer(customerId: string): Promise<Reflect[]> {
    return this.reflectModel
      .find({ customer_id: customerId })
      .populate('replies_array')
      .exec();
  }

  async reply(id: string, message: string): Promise<Reflect> {
    const newReply = await this.replyModel.create({
      content: message,
    });

    const updatedReflect = await this.reflectModel
      .findByIdAndUpdate(
        id,
        { $push: { replies_array: newReply._id } },
        { new: true },
      )
      .exec();

    if (!updatedReflect) {
      await this.replyModel.findByIdAndDelete(newReply._id);
      throw new Error('Reflect not found');
    }

    return updatedReflect;
  }

  async fetchAllReflectByAdmin(
    page: number,
    limit: number,
    filter: string = 'all',
    q?: string,
  ): Promise<{ data: Reflect[]; total: number }> {
    const skip = (page - 1) * limit;
    const searchCondition: any = {};
    if (q) {
      searchCondition['customer_id.name'] = { $regex: q, $options: 'i' };
    }

    if (filter === 'replied') {
      searchCondition['replies_array.0'] = { $exists: true }; // replies_array có ít nhất 1 phần tử
    } else if (filter === 'unreplied') {
      searchCondition['replies_array'] = { $size: 0 }; // replies_array rỗng
    }

    const [data, total] = await Promise.all([
      this.reflectModel
        .find(searchCondition)
        .skip(skip)
        .limit(limit)
        .populate('replies_array')
        .populate('customer_id')
        .lean()
        .exec(),
      this.reflectModel.countDocuments(searchCondition).exec(),
    ]);

    return { data, total };
  }
}
