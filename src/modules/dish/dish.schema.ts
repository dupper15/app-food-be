import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ObjectId, Types } from 'mongoose';
@Schema({ timestamps: true })
export class Dish {
  @Prop({ type: Types.ObjectId, ref: 'Restaurant', required: true })
  restaurant_id: ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Category', required: true })
  category_id: ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  introduce: string;

  @Prop({ required: true })
  time: string;

  @Prop({ required: true })
  image: string;

  @Prop({ required: true })
  price: string;

  @Prop({ type: [Types.ObjectId], ref: 'Topping', default: [] })
  topping: Types.ObjectId[];

  @Prop({ default: false })
  best_seller: boolean;

  @Prop({ default: true })
  isAvailable: boolean;
}
export const DishSchema = SchemaFactory.createForClass(Dish);
