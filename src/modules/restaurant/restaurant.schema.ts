import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Restaurant extends Document {
  @Prop({ required: true, type: Types.ObjectId, ref: 'RestaurantOwner' })
  owner_id: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  description: string;

  @Prop({ default: 0, required: false })
  total_reviews: number;

  @Prop({ required: true })
  address: string;

  @Prop({ default: 0, required: false })
  total_orders: number;

  @Prop({ required: false, type: Number })
  rating: number;

  @Prop({ required: false, default: [] })
  banners: Array<string>;

  @Prop({ required: false, default: 'Enable', enum: ['Enable', 'Disable'] })
  status: string;

  @Prop({ default: false, required: false })
  isDeleted: boolean;
}
export const RestaurantSchema = SchemaFactory.createForClass(Restaurant);
