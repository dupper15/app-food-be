import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
@Schema({ timestamps: true })
export class Message {
  @Prop({ required: true, ref: 'User', type: Types.ObjectId })
  sender_id: Types.ObjectId;

  @Prop({ required: false, ref: 'User', type: Types.ObjectId })
  receiver_id: Types.ObjectId;

  @Prop({ required: false, ref: 'Conversation', type: Types.ObjectId })
  conversationId: Types.ObjectId;

  @Prop({ required: false })
  content: string;

  @Prop({ required: false })
  image: string;
}
export const MessageSchema = SchemaFactory.createForClass(Message);
