import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ObjectId } from 'mongoose';
@Schema({ timestamps: true })
export class OrderItem {
  @Prop({ required: true })
  dish_id: ObjectId;

  @Prop({ required: true })
  quantity: number;

  @Prop({ default: [] })
  topping_array: Array<ObjectId>;
}
export const OrderItemSchema = SchemaFactory.createForClass(OrderItem);
