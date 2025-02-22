import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { User } from '../user/user.schema';

@Schema({ timestamps: true })
export class RestaurantOwner extends User {
  @Prop({ required: true })
  avatar: string;

  @Prop({ default: 0 })
  total_time_spend: number;

  @Prop({ default: 0 })
  total_logins: number;

  @Prop({ default: false })
  isDeleted: boolean;
}

export const RestaurantOwnerSchema =
  SchemaFactory.createForClass(RestaurantOwner);
