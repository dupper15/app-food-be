import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types, Document } from 'mongoose';
@Schema({ timestamps: true })
export class Conversation extends Document {
  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  user1: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  user2: Types.ObjectId;

  @Prop({ required: false, type: Types.ObjectId, ref: 'User' })
  last_message: Types.ObjectId;

  @Prop({ required: false, default: false })
  is_seen: boolean;
}
export const ConversationSchema = SchemaFactory.createForClass(Conversation);
