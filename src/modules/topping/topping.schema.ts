import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ObjectId, Types } from 'mongoose';
@Schema({ timestamps: true })
export class Topping {
  @Prop({ type: Types.ObjectId, ref: 'Restaurant', required: true })
  restaurant_id: ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  price: number;
}

export const ToppingSchema = SchemaFactory.createForClass(Topping);
