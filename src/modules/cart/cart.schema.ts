import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types, Schema as MongooseSchema } from 'mongoose';

@Schema({ timestamps: true })
export class Cart {
  @Prop({ required: true, type: Types.ObjectId, ref: 'Customer' })
  user_id: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'Restaurant' })
  restaurant_id: Types.ObjectId;

  @Prop({
    type: [{ type: MongooseSchema.Types.ObjectId, ref: 'OrderItem' }],
    required: true,
    default: [],
  })
  order_items: Types.ObjectId[];
}

export const CartSchema = SchemaFactory.createForClass(Cart);
