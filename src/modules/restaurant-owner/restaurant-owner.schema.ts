import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { User } from '../user/user.schema';

@Schema({ timestamps: true })
export class RestaurantOwner extends User {
  @Prop({ default: '' })
  avatar: string;

  @Prop({ default: '' })
  phone: string;

  @Prop({ default: false })
  isDeleted: boolean;

  @Prop({ default: false })
  expo_push_token: string;
}

export const RestaurantOwnerSchema =
  SchemaFactory.createForClass(RestaurantOwner);
