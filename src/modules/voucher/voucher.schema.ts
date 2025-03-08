import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type VoucherDocument = Voucher & Document;

@Schema({ timestamps: true })
export class Voucher {
  @Prop({ required: true, type: Types.ObjectId, ref: 'Restaurant' })
  restaurant_id: string;

  @Prop({ required: true, min: 0 })
  quantity: number;

  @Prop({ required: true, min: 0 })
  value: number;

  @Prop({ required: true, min: 0 })
  max: number;

  @Prop({ required: true })
  expire_date: Date;
}

export const VoucherSchema = SchemaFactory.createForClass(Voucher);
