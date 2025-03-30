import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type VoucherDocument = Voucher & Document;

@Schema({ timestamps: true })
export class Voucher {
  @Prop({ required: false, type: Types.ObjectId, ref: 'Restaurant' })
  restaurant_id: string;

  @Prop({ required: false })
  code: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true, min: 0 })
  quantity: number;

  @Prop({ required: true, min: 0 })
  value: number;

  @Prop({ required: false, min: 0 })
  max: number;

  @Prop({ required: false, min: 0 })
  min: number;

  @Prop({ required: true })
  content: string;

  @Prop({ required: true })
  start_date: Date;

  @Prop({ required: true })
  expire_date: Date;
}

export const VoucherSchema = SchemaFactory.createForClass(Voucher);
