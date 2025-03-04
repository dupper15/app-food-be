import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Notification } from '../notification/notification.schema';
import { Conversation } from '../conversation/conversation.schema';
@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ default: null })
  verified_code: number;

  @Prop({ default: 0 })
  code_expired: Date;

  @Prop({ default: false })
  isVerified: boolean;

  @Prop({ default: `active` })
  status: string;

  @Prop({ type: Notification })
  notification_array: Notification[];

  @Prop({ type: Conversation })
  conversation: Conversation[];
}
export const UserSchema = SchemaFactory.createForClass(User);
