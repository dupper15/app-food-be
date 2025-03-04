import { Schema, SchemaFactory } from '@nestjs/mongoose';@Schema({ timestamps: true })
export class Conversation {}
export const ConversationSchema = SchemaFactory.createForClass(Conversation);
