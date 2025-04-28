import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { User } from '../user/user.schema';
import { Schema as MongooseSchema, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Customer extends User {
  @Prop({ default: '' })
  name: string;

  @Prop({ default: '' })
  avatar: string;

  @Prop({ default: [], type: [String] })
  address: Array<string>;

  @Prop({ default: '' })
  phone: string;

  @Prop({ default: 0 })
  total_orders: number;

  @Prop({ default: 0 })
  last_login: Date;

  @Prop({ default: false })
  isDeleted: boolean;

  @Prop({ type: [MongooseSchema.Types.ObjectId], ref: 'History', default: [] })
  history: Types.ObjectId[];

  @Prop({
    type: [{ type: MongooseSchema.Types.ObjectId, ref: 'Restaurant' }],
    default: [],
  })
  favorite_restaurants: Types.ObjectId[];

  @Prop({ default: 0 })
  total_points: number;
}

export const CustomerSchema = SchemaFactory.createForClass(Customer);
