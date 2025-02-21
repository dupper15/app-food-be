import { Schema, SchemaFactory } from '@nestjs/mongoose';
@Schema({ timestamps: true })
export class OrderItem {}
export const OrderItemSchema = SchemaFactory.createForClass(OrderItem);
