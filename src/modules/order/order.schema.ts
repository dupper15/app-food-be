import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ObjectId, Types } from 'mongoose';
@Schema({ timestamps: true })
export class Order {
  @Prop({ type: Types.ObjectId, ref: 'OrderItem', required: true })
  array_item: ObjectId[];

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  customer_id: ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Restaurant', required: true })
  restaurant_id: ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Voucher', default: null })
  voucher_id: ObjectId;

  @Prop({ required: true })
  total_price: number;

  @Prop({ default: 0 })
  used_point: number;

  @Prop({ required: true })
  time_receive: number;

  @Prop({ required: true })
  status: string;
}
export const OrderSchema = SchemaFactory.createForClass(Order);
