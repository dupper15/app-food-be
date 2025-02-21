import { Schema, SchemaFactory } from '@nestjs/mongoose';
@Schema({ timestamps: true })
export class Voucher {}
export const VoucherSchema = SchemaFactory.createForClass(Voucher);
