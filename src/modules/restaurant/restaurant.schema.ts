import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ timestamps: true })
export class Restaurant {
  @Prop({ required: true })
  owner_id: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  address: string;

  @Prop({ required: false })
  rating: number;

  @Prop({ required: false })
  banner: Array<string>;

  @Prop({ required: false })
  category: Array<string>;

  @Prop({ default: false })
  isDeleted: boolean;
}
export const RestaurantSchema = SchemaFactory.createForClass(Restaurant);
