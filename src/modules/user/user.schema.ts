import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ type: Number, default: null })
  verified_code: number | null;

  @Prop({ default: 0 })
  code_expired: Date;

  @Prop({ default: false })
  isVerified: boolean;

  @Prop({ required: true, default: 'Enable', enum: ['Enable', 'Disable'] })
  status: string;

  @Prop({
    type: [MongooseSchema.Types.ObjectId],
    ref: 'Notification',
    default: [],
  })
  notification_array: MongooseSchema.Types.ObjectId[];

  @Prop({
    type: [MongooseSchema.Types.ObjectId],
    ref: 'Conversation',
    default: [],
  })
  conversation: MongooseSchema.Types.ObjectId[];
}
export const UserSchema = SchemaFactory.createForClass(User);
