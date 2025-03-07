import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';import { Document } from 'mongoose';

export type ReplyDocument = Reply & Document;

@Schema({ timestamps: true })
export class Reply {
  @Prop({ required: true })
  content: string;

  @Prop({ type: [String], default: [] })
  images: string[];
}

export const ReplySchema = SchemaFactory.createForClass(Reply);
