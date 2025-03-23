import { Injectable } from '@nestjs/common';import { InjectModel } from '@nestjs/mongoose';
import { Message } from './message.schema';
import { Model } from 'mongoose';

@Injectable()
export class MessageService {
  constructor(
    @InjectModel(Message.name)
    private readonly messageModel: Model<Message>,
  ) {}

  async getMessage(messageId: string): Promise<Message> {
    const message = await this.messageModel.findById(messageId).exec();
    if (!message) {
      throw new Error(`Message with ID ${messageId} not found`);
    }
    return message;
  }
}
