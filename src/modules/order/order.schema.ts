import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ObjectId, Types } from 'mongoose';
@Schema({ timestamps: true })
export class Order {
  @Prop({ type: [Types.ObjectId], ref: 'OrderItem', required: true })
  array_item: ObjectId[];

  @Prop({ type: Types.ObjectId, ref: 'Customer', required: true })
  customer_id: ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Restaurant', required: true })
  restaurant_id: ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Voucher', default: null })
  voucher_id: ObjectId;

  @Prop({ required: true })
  total_price: number;

  @Prop({ default: 0 }) // đơn 100k được 1 điểm, 1đ => 1k
  used_point: number;

  @Prop({ required: false })
  note: string;

  @Prop({ required: false, default: -1 })
  time_receive: number;

  @Prop({ required: false, default: 'Pending' }) // pending, received, preparing, ready, completed, canceled
  status: string;
}
export const OrderSchema = SchemaFactory.createForClass(Order);
