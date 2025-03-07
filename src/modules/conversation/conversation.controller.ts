import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { ConversationService } from './conversation.service';
import { SendMessageDto } from './dto/send-message.dto';
import { Conversation } from './conversation.schema';

@Controller('conversation')
export class ConversationController {
  constructor(private readonly conversationService: ConversationService) {}
  @Post()
  async createMessage(@Body() sendMessageDto: SendMessageDto): Promise<any> {
    return await this.conversationService.sendMessage(sendMessageDto);
  }
  @Get()
  async getConversations(
    @Query('userId') userId: string,
  ): Promise<Conversation[]> {
    return await this.conversationService.getConversations(userId);
  }
  @Get('messages')
  async getConversationDetail(
    @Query('conversationId') conversationId: string,
  ): Promise<any> {
    return await this.conversationService.getConversationDetail(conversationId);
  }
  @Get('messagesBy2Users')
  async getConversationDetailBy2Users(
    @Query('user1') user1: string,
    @Query('user2') user2: string,
  ): Promise<any> {
    return await this.conversationService.getConversationDetailBy2Users(
      user1,
      user2,
    );
  }
}
