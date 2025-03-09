import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';import { ObjectId, Types } from 'mongoose';
import { Document } from 'mongoose';

export type NotificationDocument = Notification & Document;

@Schema({ timestamps: true })
export class Notification {
  @Prop({ type: Types.ObjectId, required: true, ref: 'User' })
  user_id: ObjectId;

  @Prop({ required: true })
  content: string;

  @Prop({ default: false })
  isSeen: boolean;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);
