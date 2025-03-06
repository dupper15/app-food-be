import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ObjectId } from 'mongoose';
@Schema({ timestamps: true })
export class Dish {
  @Prop({ required: true })
  restaurant_id: ObjectId;

  @Prop({ required: true })
  category_id: ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  introduce: string;

  @Prop({ required: true })
  time: number;

  @Prop({ required: true })
  image: string;

  @Prop({ required: true })
  price: number;

  @Prop({ default: [] })
  topping: Array<ObjectId>;

  @Prop({ default: false })
  best_seller: boolean;

  @Prop({ default: true })
  isAvailable: boolean;
}
export const DishSchema = SchemaFactory.createForClass(Dish);
