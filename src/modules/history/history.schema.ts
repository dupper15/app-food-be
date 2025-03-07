import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';import { Document, Types, ObjectId } from 'mongoose';

export type HistoryDocument = History & Document;

@Schema({ timestamps: true })
export class History {
  @Prop({ required: true, type: Types.ObjectId, ref: 'Order' })
  order_id: ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'Customer' })
  customer_id: ObjectId;

  @Prop()
  reason: string;

  @Prop({ required: true, min: 0 })
  cost: number;

  @Prop({ required: true, min: 0 })
  sum_dishes: number;
}

export const HistorySchema = SchemaFactory.createForClass(History);
