import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';import { User } from '../user/user.schema';
import { ObjectId } from 'mongoose';

@Schema({ timestamps: true })
export class Customer extends User {
  @Prop({ default: null })
  avatar?: string;

  @Prop({ default: [] })
  address?: Array<string>;

  @Prop({ default: 0 })
  total_logins?: number;

  @Prop({ default: 0 })
  total_orders?: number;

  @Prop({ default: 0 })
  total_time_spent?: number;

  @Prop({ default: 0 })
  last_login?: Date;

  @Prop({ default: false })
  isDeleted?: boolean;

  @Prop({ default: [] })
  favorite_restaurants?: Array<ObjectId>;

  @Prop({ default: 0 })
  total_points?: number;

  @Prop({ default: null })
  verified_code: number;

  @Prop({ default: 0 })
  code_expired: Date;

  @Prop({ required: true, default: 'Enable', enum: ['Enable', 'Disable'] })
  status: string;
}

export const CustomerSchema = SchemaFactory.createForClass(Customer);
