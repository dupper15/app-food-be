import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
@Schema({ timestamps: true })
export class Order {
  @Prop({ required: true, type: Types.ObjectId, ref: 'Restaurant' })
  restaurant_id: Types.ObjectId;
}
export const OrderSchema = SchemaFactory.createForClass(Order);
