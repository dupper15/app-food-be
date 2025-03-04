import { Schema, SchemaFactory } from '@nestjs/mongoose';
@Schema({ timestamps: true })
export class Cart {}
export const CartSchema = SchemaFactory.createForClass(Cart);
