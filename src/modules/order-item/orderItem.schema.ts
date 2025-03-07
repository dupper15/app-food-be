import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ObjectId, Types } from 'mongoose';
@Schema({ timestamps: true })
export class OrderItem {
  @Prop({ type: Types.ObjectId, ref: 'Dish', required: true })
  dish_id: Types.ObjectId;
  @Prop({ required: true })
  quantity: number;

  @Prop({ default: [] })
  topping_array: Array<ObjectId>;
}
export const OrderItemSchema = SchemaFactory.createForClass(OrderItem);
