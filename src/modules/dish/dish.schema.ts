import { Schema, SchemaFactory } from '@nestjs/mongoose';
@Schema({ timestamps: true })
export class Dish {}
export const DishSchema = SchemaFactory.createForClass(Dish);
