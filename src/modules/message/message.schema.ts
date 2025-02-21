import { Schema, SchemaFactory } from '@nestjs/mongoose';@Schema({ timestamps: true })
export class Message {}
export const MessageSchema = SchemaFactory.createForClass(Message);
