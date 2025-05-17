import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';import { Document, Types } from 'mongoose';
import { User } from '../user/user.schema';

@Schema()
export class Customer extends User {
  @Prop({ type: String })
  name: string;

  @Prop({ type: String })
  avatar: string;

  @Prop({ type: [String], default: [] })
  address: string[];

  @Prop({
    type: [
      {
        address: String,
        latitude: Number,
        longitude: Number,
      },
    ],
    default: [],
  })
  addressCoordinates: Array<{
    address: string;
    latitude: number;
    longitude: number;
  }>;

  @Prop({ type: String })
  phone: string;

  @Prop({ type: Number, default: 0 })
  total_logins: number;

  @Prop({ type: Number, default: 0 })
  total_orders: number;

  @Prop({ type: Number, default: 0 })
  total_time_spent: number;

  @Prop({ type: Date })
  last_login: Date;

  @Prop({ type: Boolean, default: false })
  isDeleted: boolean;

  @Prop({ type: [String], default: [] })
  history: string[];

  @Prop({ type: [String], default: [] })
  cart: string[];

  @Prop({ type: [Types.ObjectId], default: [] })
  favorite_restaurants: Types.ObjectId[];

  @Prop({ type: Number, default: 0 })
  total_points: number;
}

export const CustomerSchema = SchemaFactory.createForClass(Customer);
