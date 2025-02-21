import { Schema, SchemaFactory } from '@nestjs/mongoose';
@Schema({ timestamps: true })
export class Order {}
export const OrderSchema = SchemaFactory.createForClass(Order);
