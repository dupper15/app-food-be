import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ObjectId, Types } from 'mongoose';
import { Document } from 'mongoose';

export type ReflectDocument = Reflect & Document;

@Schema({ timestamps: true })
export class Reflect {
  @Prop({ type: Types.ObjectId, required: true, ref: 'Customer' })
  customer_id: ObjectId;

  @Prop({ required: true })
  content: string;

  @Prop({ type: [String], default: [] })
  images: string[];

  @Prop({ type: [String], default: [] })
  replies: string[];

  @Prop({ type: Date, default: Date.now })
  create_at: Date;
}

export const ReflectSchema = SchemaFactory.createForClass(Reflect);
