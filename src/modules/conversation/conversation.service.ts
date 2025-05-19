import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Conversation } from './conversation.schema';
import { Model, Types } from 'mongoose';
import { Message } from '../message/message.schema';
import { SendMessageDto } from './dto/send-message.dto';
import { ChatBotService } from '../chatbot/chatbot.service';
import { ChatGateway } from '../../gateways/chat.gateway';

@Injectable()
export class ConversationService {
  constructor(
    @InjectModel(Conversation.name)
    private readonly conversationModel: Model<Conversation>,
    @InjectModel(Message.name)
    private readonly messageModel: Model<Message>,
    private readonly chatBotService: ChatBotService,
    private readonly chatGateway: ChatGateway,
  ) {}
  async sendMessage(sendMessageDto: SendMessageDto): Promise<any> {
    const { content, image, receiver_id, sender_id, _id } = sendMessageDto;

    if (_id) {
      const newMessage = new this.messageModel({
        sender_id,
        receiver_id,
        content,
        conversationId: new Types.ObjectId(_id),
        image,
      });
      await newMessage.save();
      const conversation = await this.conversationModel.findByIdAndUpdate(
        _id,
        {
          last_message: newMessage._id,
          is_seen: false,
        },
        { new: true },
      );
      if (!conversation) {
        throw new Error('Conversation not found');
      }

      // Notify connected clients about the new message
      const messageWithDetails = await this.messageModel
        .findById(newMessage._id)
        .lean();

      // Send the message to all users in the conversation room
      this.chatGateway.sendMessage(_id, {
        ...messageWithDetails,
        conversationId: _id,
      });

      // Notify the receiver about the conversation update
      this.chatGateway.notifyConversationUpdate(
        new Types.ObjectId(receiver_id),
        new Types.ObjectId(_id),
      );

      return conversation;
    } else {
      const newConversation = new this.conversationModel({
        user1: sender_id,
        user2: receiver_id,
        is_seen: false,
      }) as unknown as Conversation;
      await newConversation.save();
      const newMessage = new this.messageModel({
        sender_id,
        receiver_id,
        content,
        conversationId: newConversation._id,
        image,
      });
      await newMessage.save();
      await this.conversationModel.updateOne(
        { _id: newConversation._id },
        {
          $set: {
            last_message: newMessage._id,
            is_seen: false,
          },
        },
      );

      const conversationId = (newConversation._id as Types.ObjectId).toString();

      // Notify about the new message
      const messageWithDetails = await this.messageModel
        .findById(newMessage._id)
        .lean();

      // Send the message to the conversation room
      this.chatGateway.sendMessage(new Types.ObjectId(conversationId), {
        ...messageWithDetails,
        conversationId,
      });

      // Notify the receiver about the conversation update
      this.chatGateway.notifyConversationUpdate(
        new Types.ObjectId(receiver_id),
        new Types.ObjectId(conversationId),
      );

      return newConversation;
    }
  }
  async getConversations(userId: string): Promise<Conversation[]> {
    const conversations = await this.conversationModel
      .find({
        $or: [{ user1: userId }, { user2: userId }],
      })
      .lean() // giúp tối ưu và chỉ trả về dữ liệu thuần túy từ MongoDB
      .sort({ 'last_message.createdAt': -1 }); // sắp xếp theo mới nhất
    return conversations;
  }
  async getConversationDetail(conversationId: string): Promise<any> {
    try {
      if (conversationId === null || conversationId === undefined) {
        throw new Error('Conversation ID is required');
      }
      const conversation = await this.messageModel
        .find({
          conversationId: new Types.ObjectId(conversationId),
        })
        .sort({ createdAt: 1 });
      if (!conversation) {
        throw new Error('Conversation not found');
      }
      await this.conversationModel.findOneAndUpdate(
        { _id: conversationId, is_seen: false },
        { $set: { is_seen: true } },
        { new: true },
      );
      console.log('Conversation:', conversation);
      return conversation;
    } catch (error) {
      console.error('Error fetching conversation:', error);
      throw new Error('Failed to get conversation details');
    }
  }
  async getConversationDetailBy2Users(
    user1: string,
    user2: string,
  ): Promise<any> {
    try {
      if (user1 == null || user2 == null) {
        throw new Error('Users ID is required');
      }
      console.log('User1:', user1);
      console.log('User2:', user2);
      const conversation = await this.conversationModel
        .findOne({
          $or: [
            {
              user1: user1,
              user2: user2,
            },
            {
              user1: user2,
              user2: user1,
            },
          ],
        })
        .lean();

      if (!conversation) {
        console.log('No conversation found');
        return [];
      }
      console.log('Conversation:', conversation);
      const messages = await this.messageModel
        .find({ conversationId: conversation._id })
        .sort({ createdAt: 1 });

      await this.conversationModel.findOneAndUpdate(
        { _id: conversation._id, is_seen: false },
        { $set: { is_seen: true } },
        { new: true },
      );

      return messages;
    } catch (error) {
      console.error('Error fetching conversation:', error);
      throw new Error('Failed to get conversation details');
    }
  }
  async sendChatBotMessage(sendMessage: SendMessageDto): Promise<any> {
    const { content, image, receiver_id, sender_id } = sendMessage;
    const newMessage = new this.messageModel({
      sender_id,
      receiver_id,
      content,
      image,
    });
    await newMessage.save();
    const chatBotAnswer = await this.chatBotService.generateText(
      content,
      sender_id,
    );
    const newMessageChatBot = new this.messageModel({
      sender_id: 'chat-bot',
      receiver_id: sender_id,
      content: chatBotAnswer,
    });
    await newMessageChatBot.save();
    return newMessageChatBot;
  }
  async getChatBotMessage(id: string): Promise<any> {
    const chatBotMessage = await this.messageModel.find({
      $or: [{ sender_id: id }, { receiver_id: id }],
    });
    if (!chatBotMessage) {
      throw new Error('Chat bot message not found');
    }
    return chatBotMessage;
  }
}
