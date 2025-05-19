import { Module } from '@nestjs/common';
import { ConversationService } from './conversation.service';
import { ConversationController } from './conversation.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Conversation, ConversationSchema } from './conversation.schema';
import { MessageModule } from '../message/message.module';
import { ChatBotModule } from '../chatbot/chatbot.module';
import { ChatGateway } from 'src/gateways/chat.gateway';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Conversation.name,
        schema: ConversationSchema,
      },
    ]),
    MessageModule,
    ChatBotModule,
  ],
  controllers: [ConversationController],
  providers: [ConversationService, ChatGateway],
})
export class ConversationModule {}
