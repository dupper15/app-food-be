import { Schema, SchemaFactory } from '@nestjs/mongoose';
@Schema({ timestamps: true })
export class Topping {}
export const ToppingSchema = SchemaFactory.createForClass(Topping);
