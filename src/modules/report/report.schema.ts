import { Schema, SchemaFactory } from '@nestjs/mongoose';
@Schema({ timestamps: true })
export class Report {}
export const ReportSchema = SchemaFactory.createForClass(Report);
