import { Schema, SchemaFactory } from '@nestjs/mongoose';
@Schema({ timestamps: true })
export class History {}
export const HistorySchema = SchemaFactory.createForClass(History);
