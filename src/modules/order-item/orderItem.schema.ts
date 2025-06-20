import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ObjectId, Types } from 'mongoose';
@Schema({ timestamps: true })
export class OrderItem {
  @Prop({ type: Types.ObjectId, ref: 'Dish', required: true })
  dish_id: ObjectId;

  @Prop({ required: true })
  quantity: number;

  @Prop({ type: [Types.ObjectId], ref: 'Topping', default: [] })
  topping: Types.ObjectId[];

  @Prop({ type: Types.ObjectId, ref: 'Customer', required: true })
  user_id: ObjectId;

  @Prop({ required: false, default: false })
  is_paid: boolean; // true: đã thanh toán, false: chưa thanh toán
}
export const OrderItemSchema = SchemaFactory.createForClass(OrderItem);
