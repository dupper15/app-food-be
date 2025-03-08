import { Injectable } from '@nestjs/common';import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Reflect, ReflectDocument } from './reflect.schema';
import { CreateReflectDto } from './dto/createReflect';

@Injectable()
export class ReflectService {
  constructor(
    @InjectModel(Reflect.name) private reflectModel: Model<ReflectDocument>,
  ) {}

  async createReflect(createReflectDto: CreateReflectDto): Promise<Reflect> {
    return this.reflectModel.create(createReflectDto);
  }

  async fetchAllReflect(): Promise<Reflect[]> {
    return this.reflectModel.find().exec();
  }

  async fetchReflectByCustomer(customerId: string): Promise<Reflect[]> {
    return this.reflectModel.find({ customer_id: customerId }).exec();
  }

  async reply(id: string, message: string): Promise<Reflect> {
    const updatedReflect = await this.reflectModel
      .findByIdAndUpdate(id, { $push: { replies: message } }, { new: true })
      .exec();
    if (!updatedReflect) {
      throw new Error('Reflect not found');
    }
    return updatedReflect;
  }
}
